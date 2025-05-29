'use client';

import React, { use } from 'react';

import { Box, Button, Typography } from '@mui/material';
import AccessPage from './components/AccessPage';

const LinkIdPage = ({ params }: { params: Promise<{ linkId: string }> }) => {
	const { linkId } = use(params);

	const [showFileAccess, setShowFileAccess] = React.useState(false);

	const handleConfirmClick = () => {
		setShowFileAccess(true);
	};

	return (
		<>
			{!showFileAccess ? (
				<Box
					display='flex'
					flexDirection='column'
					justifyContent='center'
					alignItems='center'
					textAlign='center'
					gap={{ sm: 30, md: 35, lg: 40 }}>
					<Box>
						<Typography
							mb={2}
							variant='h1'>
							A secure file has been shared with you
						</Typography>
						<Typography variant='body1'>
							Please confirm your identity to access this document
						</Typography>
					</Box>
					<Button
						variant='contained'
						onClick={handleConfirmClick}>
						Confirm
					</Button>
				</Box>
			) : (
				<AccessPage linkId={linkId} />
			)}
		</>
	);
};

export default LinkIdPage;
