import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Paper, Box, Typography } from '@mui/material';
import { dataCaruselSection1 } from '../mockData';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

function Caruselsection1() {
  return (
    <Box
      sx={{
        p: 4,
        m: -1,
        '& .swiper-pagination-bullet-active': {
          backgroundColor: 'red'
        }
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        style={{ width: '100%' }}
      >
        {dataCaruselSection1.map((item: any, i: number) => (
          <SwiperSlide key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <Item item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
}

function Item({ item }: { item: any }) {
  return (
    <Paper
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        p: 1,
        width: { xs: '90%', md: '40em' },
        height: '20em',
        borderRadius: '20px',
        boxShadow: '4px 10px 10px 2px black',
        backgroundColor: 'rgba(255, 0, 0, 0.4)',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          alignContent: 'center',
          textAlign: 'center',
          p: 1,
          fontSize: '40px',
          fontWeight: 'bold'
        }}
      >
        {item.title}
      </Typography>
      <Typography
        variant="h2"
        sx={{
          textAlign: 'center',
          fontSize: '2em',
          p: 1,
        }}
      >
        {item.short_description}
      </Typography>
    </Paper>
  );
}

export default Caruselsection1;
