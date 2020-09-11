import { Coin } from './coin';
import './achievements.scss';

const coin = new Coin('renderCanvas');
coin.addCameras()
    .addLights()
    .latheCoin()
    .addParticles()
    .animateMovement()
    .animateSpin()
    .execute();
