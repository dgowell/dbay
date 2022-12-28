import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

function ListingDetailSkeleton() {
    return (<Box m={3} xs={{ display: 'flex', flexDirection: 'row' }}>
        <Stack direction="column" spacing={4}>
            <Stack direction="row" spacing={2}>
                <Skeleton animation="wave" variant="circular" mt={6} width={40} height={40} />
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='80%' />
            </Stack>
            <Stack direction="row" spacing={2}>
                <Skeleton animation="wave" variant="rectangular" mt={6} width='100%' height={200} />

            </Stack>
            <Stack direction="row" spacing={2}>
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
            </Stack>
            <Stack direction="column" spacing={0}>
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
                <Skeleton animation="wave" variant="text" sx={{ fontSize: '1rem' }} width='100%' />
            </Stack>
        </Stack>
    </Box>
    );
}
export default ListingDetailSkeleton;