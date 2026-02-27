import React, { useState } from 'react';
import { Box, ImageList, ImageListItem } from '@mui/material';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { photosServiciosMollar } from '../mockData';

export default function ServiciosGaleriaMollar() {
  const [index, setIndex] = useState(-1);

  // Filter out invalid photos (width/height 0) to avoid crashes
  const validPhotos = (photosServiciosMollar || []).filter(p => p.width > 0 && p.height > 0);

  if (validPhotos.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          color: 'text.secondary'
        }}
      >
        Fotos no disponibles
      </Box>
    );
  }

  const slides = validPhotos.map((photo) => ({
    src: photo.src,
  }));

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ImageList variant="masonry" cols={1} gap={8} sx={{ m: 0 }}>
        {validPhotos.slice(0, 1).map((photo, i) => (
          <ImageListItem key={i} sx={{ cursor: 'pointer', overflow: 'hidden', borderRadius: 0 }}>
            <Box
              component="img"
              src={photo.src}
              alt="Servicio"
              loading="lazy"
              onClick={() => setIndex(i)}
              sx={{
                width: '100%',
                maxHeight: 250,
                objectFit: 'cover',
                display: 'block',
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