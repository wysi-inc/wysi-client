import React, { useState } from "react";
import { playerStore, PlayerStoreInterface } from "../../resources/store";
import ReactAudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { MdClose } from 'react-icons/md';
import { BsDisc } from 'react-icons/bs';

const SongPlayer = () => {
    const startVolume: number = 20;

    const play = playerStore((state: PlayerStoreInterface) => state.play);
    const mp3: string = playerStore((state: PlayerStoreInterface) => state.mp3);
    const title: string = playerStore((state: PlayerStoreInterface) => state.title);
    const artist: string = playerStore((state: PlayerStoreInterface) => state.artist);

    const [show, setShow] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(startVolume);

    function start() {
        if (volume === 0) setVolume(startVolume);
        setShow(true);
    }

    function stop() {
        play(0, '', '');
        setShow(false);
    }

    return (
        <div className="sticky bottom-0 player" hidden={!show}>
            <div className="overflow-hidden shadow-lg bg rounded-top">
                <div className="flex flex-row items-center py-2 titleBox justify-content-between">
                    <div className="flex flex-row gap-3 items-center px-3">
                        <div className="spin">
                            <BsDisc />
                        </div>
                        <div className="truncate d-inline-block" style={{ width: 400 }}>
                            {artist} - {title}
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-circle btn-sm" onClick={stop}>
                        <MdClose />
                    </button>
                </div>
                <ReactAudioPlayer
                    src={mp3}
                    volume={volume / 100}
                    showFilledVolume={true}
                    showSkipControls={false}
                    showJumpControls={false}
                    hasDefaultKeyBindings={false}
                    layout={'horizontal-reverse'}
                    autoPlay={true}
                    autoPlayAfterSrcChange={true}
                    onPlay={start}
                    onEnded={stop}
                />
            </div>
        </div>
    )
}

export default SongPlayer;