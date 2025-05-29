'use client';

import { useCallback } from 'react';
import { Box, Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

import { FilePlusIcon } from '@/icons';
import { useModal, useToast, useUploadDocument } from '@/hooks';
import { ModalWrapper } from '@/components';

interface DragAndDropBoxProps {
	text: string;
	height?: { [key: string]: number };
	documentCount: number;
}

const DragAndDropBox = ({
	text,
	height = { sm: 150, md: 200, lg: 250 },
	documentCount,
}: DragAndDropBoxProps) => {
	const { isOpen, openModal, closeModal } = useModal();
	const { showToast } = useToast();
	const { data: session } = useSession();
	const uploadDocument = useUploadDocument();
	const router = useRouter();

	const handleUploadSuccess = useCallback(() => {
		showToast({ message: 'File uploaded successfully!', variant: 'success' });

		// Needed to explicitly refresh page to preserve SSR of parent component.
		if (!documentCount) {
			router.refresh();
		}
	}, [showToast]);

	const handleUploadError = useCallback(
		(msg?: string, status?: string) => {
			const errorMsg = `Error ${status}: ${msg}` || 'File uploading failed!';
			showToast({ message: errorMsg, variant: 'error' });
		},
		[showToast],
	);

	const handleFileSelect = useCallback(
		async (file: File | undefined) => {
			if (!file) return;

			try {
				if (!session) {
					handleUploadError('User not authenticated!');
					return;
				}

				const formData = new FormData();
				formData.append('file', file);

				const response = await uploadDocument.mutateAsync(formData);

				if (response?.document) {
					handleUploadSuccess();
				} else {
					handleUploadError('Server responded with an error.');
				}
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.message || error.message || 'Unexpected error occurred.';
				handleUploadError(errorMessage, error.response?.status);
			} finally {
			}
		},
		[session, handleUploadError, handleUploadSuccess],
	);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];

			handleFileSelect(file);
		},
		[handleFileSelect],
	);

	const { getRootProps, getInputProps } = useDropzone({ onDrop });

	return (
		<>
			{/* Box for drag-and-drop UI */}
			<div {...getRootProps()}>
				<input
					{...getInputProps({
						accept: 'application/pdf', // need to change this so it gets the allowed file types from server
						multiple: false,
					})}
				/>
				<Box
					sx={{
						border: '2px dashed rgba(236, 236, 236)',
						borderRadius: 2,
						p: { sm: '1rem', md: '1.5rem', lg: '2rem' },
						bgcolor: 'background.fill',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
						cursor: 'pointer',
						height: { height },
					}}>
					<Box
						component={FilePlusIcon}
						width={{ sm: '7rem', md: '7.5rem', lg: '8rem' }}
						height={{ sm: '7rem', md: '7.5rem', lg: '8rem' }}
						mb={{ sm: '0.1rem', md: '0.3rem', lg: '0.5rem' }}
					/>
					<Button color='secondary'>{text}</Button>
				</Box>

				{/* Modal Wrapper */}
				{/* <ModalWrapper
					variant='upload'
					dialogContentVariant='body2'
					title='Upload file(s)'
					description='Select up to 5 files to upload'
					confirmButtonText='Upload'
					toggleModal={closeModal}
					open={isOpen}
					onClose={handleUploadFile}
				/> */}
			</div>
		</>
	);
};

export default DragAndDropBox;
