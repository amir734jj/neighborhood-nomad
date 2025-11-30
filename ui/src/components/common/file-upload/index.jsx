import React, {useState, useRef, useEffect} from 'react';
import { useDropzone } from 'react-dropzone';
import Form from 'react-bootstrap/Form';
import {Button} from "react-bootstrap";
import _ from 'lodash';
import {GoogleIcon} from "../google-icon";
import {SimpleButton} from "../simple-button";
import bytes from "bytes";
import {createFileList, collectMimeTypeByCategory, shortenFileName} from "../../../utilities";
import download from "downloadjs";
import {uniqId} from "../../../utilities";
import hash from "object-hash";

export const FileUpload = ({
  onDropHandler = _.noop,
  onRemoveFile = _.noop,
  accepts = [],
  multiple = true,
  defaultValue = [],
  ...props }) => {
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const keySelector = x => x.id;

  useEffect(() => {
    setAcceptedFiles(defaultValue);
  }, [hash(defaultValue.map(keySelector))]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: collectMimeTypeByCategory(accepts),
    onDrop: (files) => {
      let newAcceptedFiles = _.uniqBy([...acceptedFiles, ...files.map(blob => ({
        blob,
        name: blob.name,
        size: blob.size,
        type: blob.type,
        id: uniqId()
      }))], keySelector);

      if (!multiple && newAcceptedFiles.length > 1) {
        newAcceptedFiles = _.takeRight(newAcceptedFiles, 1);
      }

      setAcceptedFiles(newAcceptedFiles);
      onDropHandler(newAcceptedFiles);
      fileInputRef.current.files = createFileList(files);
    },
    ...props
  });

  const clearFiles = () => {
    acceptedFiles.forEach(onRemoveFile);
    setAcceptedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset the file input
    }
  };

  const removeFile = (fileToRemove) => {
    setAcceptedFiles(acceptedFiles.filter(file => file !== fileToRemove));
    fileInputRef.current.files = createFileList(fileInputRef.current.files, [fileToRemove]);
    onRemoveFile(fileToRemove);
  };

  const getFileItems = (files) => files.map((file) => {
    return (
      <li key={file.id} style={{display: 'flex', alignItems: 'center', fontSize: "smaller"}}>
        <SimpleButton style={{padding: 0, lineHeight: 1}} tooltip='delete file' onClick={() => removeFile(file)}>
          <GoogleIcon icon='close' style={{fontSize: '24px'}}/>
        </SimpleButton>
        <a href="#" onClick={() => download(file.blob, file.name, file.type)}>
          <span
            style={{fontFamily: 'monospace'}}>{shortenFileName(file.name)} - {bytes(file.size)} bytes
          </span>
        </a>
      </li>
    );
  });

  return (
    <div>
      <div className='row g-3'>
        <Form.Group {...getRootProps({className: 'dropzone'})} className="col-9">
          <Form.Control
            type="file"
            {...getInputProps()}
            ref={fileInputRef}
            style={{ display: 'block' }}
            multiple={multiple}
          />
        </Form.Group>
        { acceptedFiles.length > 0 &&
          <Form.Group className="col-auto d-flex align-items-end">
            <Button variant="outline-danger" onClick={clearFiles}>Clear</Button>
          </Form.Group> }
      </div>
      {acceptedFiles.length ? <aside className="mt-3">
        <ul>
          {getFileItems(acceptedFiles)}
        </ul>
      </aside> : null}
    </div>
  );
};
