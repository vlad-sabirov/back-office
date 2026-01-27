import { Ref, useEffect, useRef, useState } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Avatar, Button, Icon, Modal, Slider } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { AvatarChangerProps } from '@fsd/shared/ui-kit/avatar-changer/AvatarChanger.props';
import css from './Styles.module.scss';

export const AvatarChanger = ({ backgroundColor = '#fff', className, ...props }: AvatarChangerProps): JSX.Element => {
	const [isOpenedEditModal, setOpenedEditModal] = useState<boolean>(false);
	const [editor, setEditor] = useState<AvatarEditor | null>();
	const [imgEditor, setImgEditor] = useState<string>(props.value as string);
	const [, setImgPreview] = useState<string | undefined>();
	const [imgCropped, setImgCropped] = useState<string | undefined>(props.value as string);
	const [scale, setScale] = useState<number>(1);
	const [rotate, setRotate] = useState<number>(0);
	const [position, setPosition] = useState({ x: 0.5, y: 0.5 });

	useEffect(() => {
		props.onChange?.(imgCropped as string);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [imgCropped]);

	const hiddenFileInput = useRef<HTMLInputElement>();

	return (
		<div className={className}>
			<div className={css.avatarWrapper}>
				<Avatar
					src={imgCropped ? imgCropped : undefined}
					className={css.avatar}
					color={backgroundColor}
				></Avatar>

				<Button
					color="warning"
					variant="hard"
					className={css.uploadButton}
					onClick={() => {
						if (hiddenFileInput.current) hiddenFileInput.current.click();
					}}
				>
					<Tooltip label="Загрузить фотографию" transitionDuration={300}>
						<Icon name="upload" />
					</Tooltip>
					<input
						type="file"
						accept="image/*"
						ref={hiddenFileInput as Ref<HTMLInputElement>}
						onChange={(event) => {
							if (!event?.target?.files?.[0]) return;
							const fileReader = new FileReader();
							fileReader.readAsArrayBuffer(event.target.files[0]);
							fileReader.onload = () => {
								if (fileReader?.result) {
									const url = URL.createObjectURL(new Blob([fileReader.result]));
									setImgEditor(url);
								}
							};
							setScale(1);
							setRotate(0);
							setPosition({ x: 0.5, y: 0.5 });
							setOpenedEditModal(true);
						}}
					/>
				</Button>

				{imgCropped && (
					<Button
						color="info"
						variant="hard"
						className={css.editButton}
						onClick={() => {
							if (!imgCropped.startsWith('blob:')) setImgEditor('/api/static' + imgCropped);

							setOpenedEditModal(true);
						}}
					>
						<Tooltip label="Изменить загруженную" transitionDuration={300}>
							<Icon name="edit" />
						</Tooltip>
					</Button>
				)}
			</div>

			<Modal
				title="Обрезка фотографии"
				opened={isOpenedEditModal}
				onClose={() => setOpenedEditModal(false)}
				size={660}
				centered
			>
				<AvatarEditor
					ref={(target) => setEditor(target)}
					image={imgEditor}
					width={500}
					height={500}
					border={40}
					disableBoundaryChecks={true}
					borderRadius={1000}
					scale={scale}
					rotate={rotate}
					position={position}
					onPositionChange={(event) => setPosition(event)}
					onMouseUp={() => setImgPreview(editor?.getImageScaledToCanvas().toDataURL())}
					style={{ backgroundColor: backgroundColor ? backgroundColor : '#fff' }}
					className={css.editorBoard}
				/>

				<Slider
					labelName="Увеличение"
					label={(targetValue) => (targetValue * 100).toFixed(0) + '%'}
					min={0.5}
					max={5}
					step={0.001}
					marks={[
						{ value: 0.5, label: '50%' },
						{ value: 1 },
						{ value: 2 },
						{ value: 3 },
						{ value: 5 },
						{ value: 4, label: '400%' },
					]}
					value={scale}
					onChange={(event) => setScale(event)}
					onMouseUp={() => setImgPreview(editor?.getImageScaledToCanvas().toDataURL())}
					className={css.scale}
				/>

				<Slider
					labelName="Поворот"
					label={(targetValue) => targetValue.toFixed(1) + '°'}
					min={-30}
					max={30}
					step={0.001}
					marks={[
						{ value: -30 },
						{ value: -20, label: '-20°' },
						{ value: -10, label: '-10°' },
						{ value: 0 },
						{ value: 10, label: '10°' },
						{ value: 20, label: '20°' },
						{ value: 30 },
					]}
					value={rotate}
					onChange={(event) => setRotate(event)}
					onMouseUp={() => setImgPreview(editor?.getImageScaledToCanvas().toDataURL())}
					className={css.rotate}
				/>

				<Modal.Buttons>
					<Button onClick={() => setOpenedEditModal(false)}>Отмена</Button>
					<Button
						color="success"
						variant="hard"
						onClick={async () => {
							const imageBase64 = await fetch(editor?.getImageScaledToCanvas().toDataURL() as string);
							const imageBlob = await imageBase64.blob();
							const imageUrl = URL.createObjectURL(imageBlob);

							setImgCropped(imageUrl);
							setOpenedEditModal(false);
							if (hiddenFileInput?.current?.value) hiddenFileInput.current.value = '';
						}}
					>
						Сохранить
					</Button>
				</Modal.Buttons>
			</Modal>
		</div>
	);
};
