import { Coin } from './coin';
import './achievements.scss';

const coin = new Coin('renderCanvas');
coin.addCameras()
    .addLights()
    .addCoin()
    .addCoinMovement()
    .addCoinSpin()
    .addConfetti()
    .execute();
