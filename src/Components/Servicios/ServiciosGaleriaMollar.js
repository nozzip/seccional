import React, { useState, useCallback } from "react";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import { photosServiciosMollar } from "../mockData";
import { makeStyles } from "@material-ui/core";



const useStyles = makeStyles((theme) => ({

  carousel:{
    backgroundColor:'green',
  },
}));



function ServiciosGaleriaMollar() {

  const classes = useStyles();
  const [currentImage, setCurrentImage] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = useCallback((event, { photo, index }) => {
    setCurrentImage(index);
    setViewerIsOpen(true);
  }, []);

  const closeLightbox = () => {
    setCurrentImage(0);
    setViewerIsOpen(false);
  };

  return (
    <div   >
      <Gallery photos={photosServiciosMollar} onClick={openLightbox} />
      <ModalGateway >
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}  >
            <Carousel
              currentIndex={currentImage}
              views={photosServiciosMollar.map(x => ({
                ...x,
                srcset: x.srcSet,
                caption: x.title
              }))}
            />
          </Modal>
        ) : null}
      </ModalGateway>
    </div>
  );
}

export default ServiciosGaleriaMollar;