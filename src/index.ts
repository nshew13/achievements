import { Coin } from './coin';
import './achievements.scss';

// const coin = new Coin('renderCanvas');
const coin = new Coin('renderCanvas', true);
coin.addCameras()
    .addLights()
    // .addCoin()
    .latheCoin()
    .addParticles()
    .animateMovement()
    .animateSpin()
    .execute();
