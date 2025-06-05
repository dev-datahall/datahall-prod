'use client';

import { useEffect, useState } from 'react';

import { ChevronDownIcon, ChevronSelectorVerticalIcon } from '@/icons';

import {
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material';

import { EmptyState, Paginator } from '@/components';

import ContactsTableRow from './ContactsTableRow';

import { useSort } from '@/hooks';
import { useContactsQuery } from '@/hooks/data';

import { Contact } from '@/shared/models';

export default function ContactsTable() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(9);
	const [rowHeight, setRowHeight] = useState(59);

	const { data, isLoading, isError, error } = useContactsQuery();

	const parsedContacts = data?.map((contact) => ({
		...contact,
		lastActivity: new Date(contact.lastActivity),
	}));

	const { sortedData, orderDirection, orderBy, handleSortRequest } = useSort<Contact>(
		parsedContacts || [],
	);

	//Calculate the row height of the table
	const calculateRowHeight = () => {
		const width = window.innerWidth;
		if (width >= 1200) {
			return 59; // lg
		} else if (width >= 900) {
			return 54; // md
		} else {
			return 47; // sm
		}
	};

	//Calculate the pageSize based on resizing
	useEffect(() => {
		setRowHeight(calculateRowHeight());
		const handleResize = () => {
			const availableHeight = window.innerHeight - 200; // Adjust for header, footer, etc.
			const calculatedRowsPerPage = Math.floor(availableHeight / rowHeight);
			setPageSize(calculatedRowsPerPage);
		};

		// Initial calculation and add resize listener
		handleResize();
		window.addEventListener('resize', handleResize);

		// Cleanup the event listener on unmount
		return () => window.removeEventListener('resize', handleResize);
	}, [rowHeight]);

	const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);
	const totalPages = Math.ceil(sortedData.length / pageSize);

	if (isLoading) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				mt={4}>
				<CircularProgress />
			</Box>
		);
	}

	if (isError) {
		return (
			<Box mt={4}>
				<Typography
					color='error'
					align='center'
					variant='h6'>
					{error.message}
				</Typography>
			</Box>
		);
	}

	return (
		<>
			<TableContainer component={Paper}>
				<Table aria-label='Contacts Table'>
					<TableHead>
						<TableRow>
							<TableCell sx={{ width: '30%', pl: '2rem' }}>NAME</TableCell>
							<TableCell sx={{ width: '25%' }}>LAST VIEWED LINK</TableCell>
							<TableCell sx={{ width: '30%', textAlign: 'center' }}>
								<TableSortLabel
									active={orderBy === 'lastActivity'}
									direction={orderDirection}
									onClick={() => handleSortRequest('lastActivity')}
									hideSortIcon={false}
									IconComponent={
										orderDirection === undefined ? ChevronSelectorVerticalIcon : ChevronDownIcon
									}>
									LAST ACTIVITY
								</TableSortLabel>
							</TableCell>
							<TableCell sx={{ width: '15%', textAlign: 'center' }}>VISITS</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!paginatedData.length ? (
							<TableRow>
								<TableCell
									colSpan={4}
									sx={{ width: '100%' }}>
									<EmptyState message='When users download a file and provide personal information, they will appear here.' />
								</TableCell>
							</TableRow>
						) : (
							paginatedData.map((row) => (
								<ContactsTableRow
									key={row.id}
									contact={row}
								/>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Paginator
					page={page}
					totalPages={totalPages}
					onPageChange={setPage}
					pageSize={pageSize}
					totalItems={sortedData.length}
				/>
			)}
		</>
	);
}
