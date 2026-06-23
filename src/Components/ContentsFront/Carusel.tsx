import React, { useState, useEffect, useRef } from 'react';
import Carousel from 'react-material-ui-carousel';
import { Paper, Box, useTheme, IconButton, Tooltip, CircularProgress, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, alpha, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { dataCarusel } from '../mockData';
import { supabase } from '../../supabaseClient';

interface CarouselImage {
  id: string;
  image_url: string;
}

function Carusel() {
  const theme = useTheme();
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAffiliate, setCurrentAffiliate] = useState<any>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("current_affiliate");
      if (stored) {
        setCurrentAffiliate(JSON.parse(stored));
      } else {
        const mobileName = localStorage.getItem("mobile_app_name");
        const mobileLegajo = localStorage.getItem("mobile_app_legajo");
        if (mobileName && mobileLegajo) {
          setCurrentAffiliate({
            nombre: mobileName.split(" ")[0],
            apellido: mobileName.split(" ").slice(1).join(" "),
            legajo: mobileLegajo
          });
        } else {
          setCurrentAffiliate(null);
        }
      }
    };
    checkUser();
    window.addEventListener("affiliate_login", checkUser);
    return () => window.removeEventListener("affiliate_login", checkUser);
  }, []);

  const isAdmin = currentAffiliate && (
    currentAffiliate.role === 'admin' ||
    currentAffiliate.role === 'superadmin' ||
    ['34185803', '042418/00', '23276817159'].includes(currentAffiliate.legajo) ||
    ['34185803', '23276817159'].includes(currentAffiliate.cuil)
  );

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching carousel images:", error);
      } else if (data && data.length > 0) {
        setImages(data);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;
    setAdding(true);
    try {
      const { error } = await supabase
        .from('carousel_images')
        .insert({ image_url: newImageUrl.trim() });
      if (error) throw error;
      setNewImageUrl("");
      setOpenAddDialog(false);
      fetchImages();
    } catch (err) {
      console.error("Error adding image", err);
      alert("Error al agregar la imagen");
    } finally {
      setAdding(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setAdding(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('carousel_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('carousel_images')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('carousel_images')
        .insert({ image_url: publicUrl });

      if (insertError) throw insertError;
      
      setOpenAddDialog(false);
      fetchImages();
    } catch (err) {
      console.error("Error uploading image", err);
      alert("Error al subir la imagen. Asegúrate de tener el bucket 'carousel_images' creado en Supabase Storage.");
    } finally {
      setAdding(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!window.confirm("¿Estás seguro de eliminar esta imagen del carrusel?")) return;
    try {
      const { error } = await supabase
        .from('carousel_images')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchImages();
    } catch (err) {
      console.error("Error deleting image", err);
      alert("Error al eliminar la imagen");
    }
  };

  const displayImages = images.length > 0 
    ? images 
    : dataCarusel.map(d => ({ id: d.id.toString(), image_url: d.thumbnail }));

  return (
    <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 1, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        {loading ? (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
            <CircularProgress />
          </Box>
        ) : (
          <Carousel
            autoPlay={true}
            interval={5000}
            animation="slide"
            indicators={true}
            navButtonsAlwaysVisible={false}
            activeIndicatorIconButtonProps={{
              style: {
                color: theme.palette.primary.main
              }
            }}
            sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              '& .MuiPaper-root': { height: '100%' },
              '& > div': { flex: 1, display: 'flex', flexDirection: 'column' },
              '& > div > div': { flex: 1 }
            }}
          >
            {displayImages.map((item, i) => (
              <Item key={item.id || i} item={item} isAdmin={isAdmin} onDelete={() => handleDeleteImage(item.id)} />
            ))}
          </Carousel>
        )}
      </Box>

      {isAdmin && (
        <>
          <Tooltip title="Agregar imagen al carrusel">
            <Fab 
              color="primary" 
              size="small"
              onClick={() => setOpenAddDialog(true)}
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            >
              <AddPhotoAlternateIcon />
            </Fab>
          </Tooltip>

          <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Agregar Imagen al Carrusel</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="URL de la imagen"
                type="url"
                fullWidth
                variant="outlined"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  O sube una imagen desde tu computadora:
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outlined" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={adding}
                  fullWidth
                >
                  {adding ? <CircularProgress size={24} /> : "Seleccionar y Subir Archivo"}
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAddDialog(false)}>Cancelar</Button>
              <Button onClick={handleAddImage} variant="contained" disabled={!newImageUrl.trim() || adding}>
                {adding ? <CircularProgress size={24} /> : "Agregar URL"}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

function Item({ item, isAdmin, onDelete }: { item: CarouselImage, isAdmin: boolean | null, onDelete: () => void }) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minHeight: { xs: 350, md: 400 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
        '&:hover .admin-delete-btn': {
          opacity: 1
        }
      }}
    >
      <Box
        component="img"
        src={item.image_url}
        alt="banner"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      
      {isAdmin && (
        <Tooltip title="Eliminar imagen">
          <IconButton
            className="admin-delete-btn"
            onClick={onDelete}
            color="error"
            sx={{
              position: 'absolute',
              top: 16,
              right: 60,
              bgcolor: 'rgba(255,255,255,0.8)',
              opacity: 0,
              transition: 'opacity 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)',
              }
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
}

export default Carusel;
