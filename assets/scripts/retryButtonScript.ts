import { _decorator, director, find, Label, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('retryButtonScript')
export class retryButtonScript extends Component {
    start() {
       
    }

    update(deltaTime: number) {
        
    }

    onRetryButtonClick() {
        director.loadScene("scenes/scene");

    }
}


