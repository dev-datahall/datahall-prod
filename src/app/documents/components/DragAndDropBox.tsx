'use client';

import { useCallback, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useDropzone } from 'react-dropzone';

import { useModal, useToast } from '@/hooks';
import axios from 'axios';

import { FilePlusIcon } from '@/icons';
import { ModalWrapper } from '@/components';

interface DragAndDropBoxProps {
	text: string;
	height?: { [key: string]: number };
}

const DragAndDropBox = ({ text, height = { sm: 150, md: 200, lg: 250 } }: DragAndDropBoxProps) => {
	const { isOpen, openModal, closeModal } = useModal();
	const { showToast } = useToast();
	const { data: session } = useSession();
	const [uploading, setUploading] = useState(false);
	const router = useRouter();

	const handleUploadSuccess = useCallback(() => {
		showToast({ message: 'File uploaded successfully!', variant: 'success' });
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

			setUploading(true);

			try {
				if (!session) {
					handleUploadError('User not authenticated!');
					return;
				}

				const formData = new FormData();
				formData.append('file', file);

				const response = await axios.post('/api/documents', formData);

				if (response?.status === 200 && response.data?.document) {
					handleUploadSuccess();
					//TODO: Temporary fix, until we use tanstack query or zustand
					setTimeout(() => {
						window.location.reload();
					}, 1000);
				} else {
					handleUploadError('Server responded with an error.');
				}
			} catch (error: any) {
				const errorMessage =
					error.response?.data?.message || error.message || 'Unexpected error occurred.';
				handleUploadError(errorMessage, error.response?.status);
			} finally {
				setUploading(false);
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
