import React, { useState } from 'react';
import { Box, ImageList, ImageListItem, useMediaQuery, useTheme } from '@mui/material';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photos } from '../mockData';

export default function FotosGaleria() {
  const [index, setIndex] = useState(-1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMd = useMediaQuery(theme.breakpoints.down('md'));

  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return null;
  }

  // Map photos for Lightbox
  const slides = photos.map((photo) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
  }));

  return (
    <Box>
      <ImageList
        variant="masonry"
        cols={isMobile ? 1 : isMd ? 2 : 3}
        gap={16}
      >
        {photos.map((photo, i) => (
          <ImageListItem key={i} sx={{ cursor: 'pointer', overflow: 'hidden', borderRadius: 2 }}>
            <Box
              component="img"
              src={`${photo.src}?w=400&fit=crop&auto=format`}
              alt={photo.title || 'Galería'}
              loading="lazy"
              onClick={() => setIndex(i)}
              sx={{
                width: '100%',
                display: 'block',
                transition: 'transform 0.4s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>

      <Lightbox
        index={index}
        slides={slides}
        open={index >= 0}
        close={() => setIndex(-1)}
      />
    </Box>
  );
}
