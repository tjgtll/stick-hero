import { _decorator,director,find, Component, tween,UITransform, Vec3, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('startButtonScript')
export class startButtonScript extends Component {
    @property(Node)
    h:Node = null;
    @property(Node)
    p:Node = null;
    @property(Node)
    s:Node = null;
    @property(Node)
    b:Node = null;

    update(deltaTime: number) {
        
    }
    onLoad() {
        
    }
    onStartButtonClick() {
        this.moveActionPosition(this.s,2.0,new Vec3(-260,-100,this.s.position.z)).start();
        this.moveActionPosition(this.p,2.0,new Vec3(-360,-700,this.p.position.z)).start();
        this.moveActionPosition(this.h,2.0,new Vec3(-290,-100,this.h.position.z)).start();
        this.moveActionPosition(this.b,2.0,new Vec3(this.b.position.x,screen.width,this.b.position.z))
        .call(() => {
            console.log(3);
            director.loadScene("scenes/scene");
        })
        .start();

    }
    
    private moveActionPosition(object: Node, duration: number, targetPosition: Vec3) {
        return tween(object).to(duration, { position: targetPosition });
    }
}


