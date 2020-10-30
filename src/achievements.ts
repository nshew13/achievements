import { Coin } from './coin';

export class Achievements {
    public constructor () {
        document.addEventListener(Coin.EVENT_ANIMATION_IN_POSITION, () => {
            this._showLabel();
        });

        const coin = new Coin('renderCanvas');
        coin.addCameras()
            .addLights()
            .latheCoin()
            .addParticles()
            .animateMovement()
            .animateSpin()
            .execute();
    }

    private _showLabel () {
        const titleEl = document.createElement('div');
        titleEl.appendChild(document.createTextNode('Congratulations!'));
        titleEl.className = 'achievement-title fade';

        const descEl = document.createElement('div');
        descEl.appendChild(document.createTextNode('You unlocked the Crowning Achievement.'));
        descEl.className = 'achievement-desc fade';

        const wrapperEl = document.getElementById('achievementWrapper');
        wrapperEl.append(titleEl);
        setTimeout(() => wrapperEl.append(descEl), 500);
    }
}
