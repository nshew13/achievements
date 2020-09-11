import { Coin } from './coin';
import './achievements.scss';

const coin = new Coin('renderCanvas', true);
coin.addCameras()
    .addLights()
    // .addCoin()
    .latheCoin()
    .addParticles()
    .addCoinMovement()
    .addCoinSpin()
    .execute();
