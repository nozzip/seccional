import React from "react";
import { Paper, Typography, Box, alpha, useTheme, Avatar } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface InfoCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  color?: string;
  onClick?: () => void;
  selected?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "primary.main",
  onClick,
  selected = false,
}) => {
  const theme = useTheme();
  
  // Resolve color string if it's a theme path like "primary.main"
  const getResolvedColor = (colorStr: string) => {
    if (colorStr.includes(".")) {
      const [palette, shade] = colorStr.split(".");
      return (theme.palette as any)[palette][shade];
    }
    return colorStr;
  };

  const resolvedColor = getResolvedColor(color);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 4,
        border: "1px solid",
        borderColor: selected ? color : alpha(theme.palette.divider, 0.1),
        bgcolor: selected ? alpha(resolvedColor, 0.05) : "background.paper",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        "&:hover": onClick ? {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(resolvedColor, 0.1)}`,
          borderColor: color,
        } : {},
      }}
    >
      <Avatar
        sx={{
          bgcolor: alpha(resolvedColor, 0.1),
          color: color,
          width: 56,
          height: 56,
          borderRadius: 2.5,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
            lineHeight: 1.2,
            mb: 0.5,
            display: "block",
            letterSpacing: 1
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: selected ? color : "text.primary",
            transition: "color 0.3s"
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default InfoCard;
