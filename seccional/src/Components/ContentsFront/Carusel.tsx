import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { Box, Paper } from '@mui/material';
import { dataCarusel } from '../mockData';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

function Carusel() {
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        '& .swiper-pagination-bullet-active': {
          backgroundColor: '#1a5f7a'
        },
        '& .swiper-button-next, & .swiper-button-prev': {
          color: 'rgba(255,255,255,0.7)',
          transform: 'scale(0.7)',
          '&:hover': {
            color: 'white'
          }
        }
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        style={{ width: '100%' }}
      >
        {dataCarusel.map((item, i) => (
          <SwiperSlide key={i}>
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
      elevation={0}
      sx={{
        height: { xs: 300, md: 500 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'transparent',
      }}
    >
      <Box
        component="img"
        src={item.thumbnail}
        alt="banner"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Paper>
  );
}

export default Carusel;

