import { 
    _decorator,
    director,
    find,
    randomRange, 
    view, 
    Component, 
    tween, 
    Node, 
    Label, 
    UITransform, 
    Quat, 
    input, 
    Input,
    EventTouch, 
    KeyCode, 
    EventKeyboard,  
    Vec3, } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('gameManager')

export class gameManager extends Component {
    score:                      number = -1;
    resizeSpeed:                number = 1;
    isResizing:                 boolean = false;
    isKeyDown:                  boolean = false; 
    isAnimating:                boolean = false;
    isMoving:                   boolean = false;
    targetRotation180           = Quat.fromEuler(new Quat(), 0, 0, 180);
    targetRotation270           = Quat.fromEuler(new Quat(), 0, 0, 270);
    targetRotation360           = Quat.fromEuler(new Quat(), 0, 0, 360);

    platformStartTransform:     UITransform = null;
    platformEndTransform:       UITransform = null;
    stickStartTransform:        UITransform = null;
    stickEndTransform:          UITransform = null;
    playerTransform:            UITransform = null;
    @property(Node)
    stickStart:                 Node = null;
    @property(Node)
    stickEnd:                   Node = null;
    @property(Node)
    player:                     Node = null;
    @property(Node)
    platformStart:              Node = null;
    @property(Node)
    platformEnd:                Node = null;
    @property(Node)
    background:                 Node = null;
    @property(Node)
    perfect:                    Node = null;
    @property(Label)
    scoreLabel:                 Label = null;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN,      this.onKeyDown,     this);
        input.on(Input.EventType.KEY_UP,        this.onKeyUp,       this);
        input.on(Input.EventType.TOUCH_START,   this.onTouchStart,  this);
        input.on(Input.EventType.TOUCH_END,     this.onTouchEnd,    this);
        
        this.updateScore();

        this.platformStartTransform      = this.platformStart.getComponent(UITransform);
        this.platformEndTransform        = this.platformEnd.getComponent(UITransform);
        this.stickStartTransform         = this.stickStart.getComponent(UITransform);
        this.stickEndTransform           = this.stickEnd.getComponent(UITransform);
        this.playerTransform             = this.player.getComponent(UITransform);

        this.movePlatformEnd();
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
       
    }

    onTouchStart(event: EventTouch) {
        if (!this.isAnimating) {
            this.isResizing = true;
            this.schedule(this.resizeStick, 0);
            this.isKeyDown = true;
        }
    }

    onTouchEnd(event: EventTouch) {
        if (!this.isAnimating && this.isKeyDown) {
            this.isAnimating = true;
            this.isResizing = false;
            this.unschedule(this.resizeStick);
            this.handleGameResult();    
            this.isKeyDown = false;
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
            case KeyCode.ARROW_UP: {
                if (!this.isAnimating) {
                    this.isResizing = true;
                    this.isKeyDown = true;
                    this.schedule(this.resizeStick, 0);
                }
                break;
            }
            case KeyCode.KEY_W: {
                break;
            }
            default:
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
            case KeyCode.ARROW_UP: {
                if (!this.isAnimating && this.isKeyDown) {
                    this.isAnimating = true;
                    this.isResizing = false;
                    this.unschedule(this.resizeStick);
                    this.handleGameResult();    
                    this.isKeyDown = false;
                }
                break;
            }
            default:
                break;
        }
    }

    private handleGameResult(){
        this.stickStartTransform.height = Math.round(this.stickStartTransform.height);
        let stickHeight = this.stickStartTransform.height;
        let stickPositionX = this.stickStart.position.x;

        let width = this.platformEndTransform.width;
        let positionX = this.platformEnd.position.x;

        let isPerfect = stickPositionX + stickHeight > positionX + this.perfect.position.x && 
                        stickPositionX < positionX + width - this.perfect.position.x;
    
        if (isPerfect) {
            this.updateScore();
        }

        let isWin = stickPositionX + stickHeight > positionX && stickPositionX + stickHeight < positionX + width;

        if (isWin) {
            this.winActions();
        } else {
            this.looseActions();
        }
    }

    private winActions(){
        this.updateScore();

        tween(this.stickStart)
            .to(0.5, { rotation: this.targetRotation270 })
            .call(() => {
                this.movePlayerToTopRight();
            })
            .to(1, {})
            .call(() => {
                this.moveObjects();
            })
            .to(3, {})
            .call(() => {
                this.resetStick();
                this.isAnimating = false;
            })
            .start();
    };

    private looseActions (){
        tween(this.stickStart)
            .to(0.5, { rotation: this.targetRotation270 })
            .call(() => {
                this.movePlayerToTopDawn();
            })
            .to(1.5, {})
            .call(() => {
                this.screenShaking(10);
            })
            .to(0.1, {})
            .call(() => {
                this.screenShaking(-10);
            })
            .to(0.1, {})
            .call(() => {
                this.screenShaking(10);
            })
            .to(0.1, {})
            .call(() => {
                this.screenShaking(-10);
            })
            .to(0.1, {})
            .call(() => {
                this.screenShaking(-10);
            })
            .to(0.1, {})
            .call(() => {
                this.screenShaking(10);
            })
            .to(0.1, {})
            .call(() => {
                this.showGameOverScreen();
            })
            .start();
    }

    private screenShaking(x){
        this.moveActionPosition(
            this.node,0.2, 
            new Vec3(this.node.position.x - x, this.node.position.y, this.node.position.z)
        ).start();
    }

    private resetStick() {
        this.stickEnd.position = this.stickStart.position.clone();
        this.stickEndTransform.setContentSize( this.stickStartTransform.contentSize.x,  this.stickStartTransform.contentSize.y ); 
        this.moveActionRotation(
            this.stickStart,0.001, 
            this.targetRotation360
            ).start();
        
        this.stickStartTransform.setContentSize(5,0);

        this.stickStart.position = new Vec3(
            Math.round(this.player.position.x + this.playerTransform.width), 
            this.stickStart.position.y, 
            this.stickStart.position.z);
    }

    private resizeStick() {
        if (this.isResizing) {
            this.stickStartTransform.setContentSize(
                this.stickStartTransform.contentSize.x, 
                this.stickStartTransform.contentSize.y + this.resizeSpeed
                );
        }
    }

    private movePlayerToTopRight() {
        if (this.player && this.platformEnd) {
            let targetX = this.platformEnd.position.x + this.platformEndTransform.contentSize.width - this.playerTransform.width;
            this.moveActionPosition(
                this.player,0.9,
                new Vec3(Math.round(targetX), this.player.position.y, this.player.position.z)
                ).start();
        }
    } 
    private movePlayerToTopDawn(){
        if (this.player && this.stickEnd) {
            let targetX = this.stickStart.position.x + this.stickStartTransform.contentSize.height;
            
            this.moveActionPosition(
                this.player,1.0,  
                new Vec3(targetX, this.player.position.y, this.player.position.z)
                ).call(() => {
                    this.moveActionRotation(
                        this.stickStart,0.3, 
                        this.targetRotation180
                        ).start();
                    this.moveActionPosition(
                        this.player, 0.5,
                        new Vec3(targetX, -screen.height, this.player.position.z)
                        ).start();
                })
                .start();               
        }
    }

    private moveObjects() {
        this.isMoving = true;
        let shiftSize = Math.round(-this.platformStart.position.x + this.platformEnd.position.x);
        const objects = [this.stickStart,this.player, this.stickEnd, this.platformStart, this.platformEnd];
        for (const object of objects) {
            this.moveActionPosition(
                object, 2,
                new Vec3(Math.round(object.position.x) - shiftSize, object.position.y, object.position.z)
                ).start();
        }
        this.moveBackground();
        this.moveActionPosition(
            this.platformEnd, 2,
            new Vec3(
                this.platformEnd.position.x - shiftSize,
                this.platformEnd.position.y, 
                this.platformEnd.position.z
                )
            )
            .call(() => {
                this.platformStartTransform.width = this.platformEndTransform.width;
                this.platformStart.position = this.platformEnd.position.clone();
                
                this.movePlatformEnd();
            })
            .call(() => {
                this.isMoving = false;
            })
            .start();
    }

    private movePlatformEnd(){
        this.platformEndTransform.width = Math.round(Math.random() * (200 - 20) + 20);
        this.perfect.position.set(Math.round(this.platformEndTransform.width/2 - 3), this.perfect.position.y,this.perfect.position.z);
        this.platformEnd.position = new Vec3(
            screen.width - this.platformEndTransform.width, 
            this.platformEnd.position.y, 
            this.platformEnd.position.z
        );
        const minX = this.platformStart.position.x + this.platformStartTransform.width + 100;
        const maxX = this.platformStart.position.x + view.getVisibleSize().width - this.platformEndTransform.width;
        let positionX = Math.round(randomRange(minX, maxX));
        this.moveActionPosition(
            this.platformEnd, 0.5, 
            new Vec3(
                positionX,
                this.platformStart.position.y,
                this.platformStart.position.z
        )).start() ;
    }

    private moveActionPosition (object: Node, duration: number, vec: Vec3) {
        return tween(object)
            .to(duration, { position: vec})
            .start();
    }

    private moveActionRotation (object: Node, duration: number, quat: Quat) {
        return tween(object)
            .to(duration, { rotation: quat})
            .start();
    }

    private updateScore() {
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${++this.score}`;
        }
    }

    private moveBackground() {
        const duration = 2.0; 
        const targetX = 100; 

        tween(this.background)
            .to(duration, { position: new Vec3(this.background.position.x-targetX, this.background.position.y, this.background.position.z) })
            .start();
    }

    private showGameOverScreen(){
        director.loadScene("scenes/gameOver", (err, scene) => {
            if (!err) {
                let labelNode = find("Canvas/Camera/finalScore", scene); 
                let labelComponent = labelNode.getComponent(Label);

                if (labelComponent) {
                    labelComponent.string = "Final Score: " + this.score; 
                }
            }
        });
    }
}


