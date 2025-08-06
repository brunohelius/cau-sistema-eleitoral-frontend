import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Upload } from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (files: FileList) => void;
  multiple?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  multiple = false,
  accept = "*/*"
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onFileSelect(files);
    }
  };

  return (
    <Box>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id="file-upload"
        multiple={multiple}
        type="file"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<Upload />}
          fullWidth
        >
          <Typography>
            {multiple ? 'Selecionar Arquivos' : 'Selecionar Arquivo'}
          </Typography>
        </Button>
      </label>
    </Box>
  );
};