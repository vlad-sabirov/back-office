import { FC, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { IAudioPlayerProps } from './audio-player.types';
import cn from 'classnames';
import WaveSurfer from 'wavesurfer.js';
import TailwindColors from '@config/tailwind/color';
import { useSecondsToTime } from '@fsd/shared/lib/hooks/use-seconds-to-time/use-seconds-to-time';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import css from './audio-player.module.scss';

const useWavesurfer = ({ src, containerRef }: { containerRef: RefObject<HTMLDivElement>; src: string }) => {
	const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
	const [duration, setDuration] = useState<number>(0);

	useEffect(() => {
		if (!containerRef.current) return;

		const ws = WaveSurfer.create({
			url: src,
			container: containerRef.current,
			height: 40,
			barWidth: 2,
			barRadius: 2,
			barGap: 2,
			waveColor: TailwindColors.primary[100],
			progressColor: TailwindColors.primary.main,
			cursorWidth: 0,
		});

		ws.on('ready', function () {
			setDuration(Math.round(ws.getDuration()));
		});

		setWavesurfer(ws);

		return () => {
			ws.destroy();
		};
	}, [src, containerRef]);

	useEffect(() => {
		if (!wavesurfer) {
			return;
		}
		wavesurfer.setVolume(1);
	}, [wavesurfer]);

	return { wavesurfer, duration };
};

export const AudioPlayer: FC<IAudioPlayerProps> = (props) => {
	const { src, className } = props;

	const containerRef = useRef<HTMLDivElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState<number>(0);
	const { wavesurfer, duration } = useWavesurfer({ src: src, containerRef });
	const formattedCurrentTime = useSecondsToTime(currentTime);
	const formattedDuration = useSecondsToTime(duration);

	const onPlayClick = useCallback(() => {
		wavesurfer?.isPlaying() ? wavesurfer.pause() : wavesurfer?.play();
	}, [wavesurfer]);

	useEffect(() => {
		if (!wavesurfer) return;

		setCurrentTime(0);
		setIsPlaying(false);

		const subscriptions = [
			wavesurfer.on('play', () => setIsPlaying(true)),
			wavesurfer.on('pause', () => setIsPlaying(false)),
			wavesurfer.on('timeupdate', (currentTime) => setCurrentTime(Math.round(currentTime))),
		];

		return () => {
			subscriptions.forEach((unsub) => unsub());
		};
	}, [wavesurfer]);

	return (
		<div className={cn(css.root, className)}>
			<Button
				onClick={onPlayClick}
				color={'primary'}
				className={css.control}
				variant={isPlaying ? 'hard' : 'easy'}
			>
				<Icon name={isPlaying ? 'pause' : 'play'} />
			</Button>

			<div ref={containerRef} style={{ minHeight: '40px', maxHeight: '40px' }} />

			<TextField className={css.timer} size={'small'}>
				{formattedCurrentTime} / {formattedDuration}
			</TextField>

			<a href={src} className={css.download}>
				<Icon name={'download'} />
			</a>
		</div>
	);
};
