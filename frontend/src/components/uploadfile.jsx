// 'use client';

// import React, { useState, useCallback, FormEvent } from 'react';
// import { useDropzone } from 'react-dropzone';
// import {
// 	Check,
// 	X,
// 	CloudUpload,
// 	TriangleAlert,
// 	FileText,
// 	Sheet,
// 	FileCheck2,
// 	FileChartLine,
// } from 'lucide-react';
// import {
// 	acceptTypes,
// 	allowedTypes,
// 	excelTypes,
// 	imageTypes,
// 	maxSize,
// 	pdfTypes,
// 	pptTypes,
// 	wordTypes,
// } from '@/types/constants';

// const UploadForm = () => {
// 	const [file, setFile] = useState<File>();
// 	const [error, setError] = useState<string | null>(null);
// 	const [uploadStatus, setUploadStatus] = useState<boolean>(false);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

// 	const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: string | any[]) => {
// 		const selectedFile = acceptedFiles[0];
// 		setError(null);
// 		setUploadStatus(false);
// 		setDimensions({ width: 0, height: 0 });

// 		if (rejectedFiles.length > 0) {
// 			setError('Please check file type and size (max 5MB)');
// 			return;
// 		}

// 		if (!allowedTypes.includes(selectedFile.type)) {
// 			setError('File type not supported');
// 			return;
// 		}

// 		if (selectedFile.size > maxSize) {
// 			setError('File size exceeds 5MB limit');
// 			return;
// 		}

// 		setFile(selectedFile);

// 		if (imageTypes.includes(selectedFile.type)) {
// 			const reader: FileReader = new FileReader();
// 			reader.onload = () => {
// 				const img: HTMLImageElement = new Image();
// 				if (typeof reader.result === 'string') {
// 					img.src = reader.result;
// 				}
// 				img.onload = () => {
// 					setDimensions({
// 						width: img.width,
// 						height: img.height,
// 					});
// 				};
// 			};
// 			reader.readAsDataURL(selectedFile);
// 		}
// 	}, []);

// 	const { getRootProps, getInputProps, isDragActive } = useDropzone({
// 		onDrop,
// 		accept: acceptTypes,
// 		maxSize,
// 		multiple: false,
// 	});

// 	const removeFile = () => {
// 		setFile(undefined);
// 		setError(null);
// 		setUploadStatus(false);
// 	};

// 	const getFilePreview = () => {
// 		if (!file) return null;

// 		if (file.type.startsWith('image/')) {
// 			return (
// 				<img src={URL.createObjectURL(file)} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
// 			);
// 		}
// 		return (
// 			<div className="w-20 h-20 bg-secondary flex items-center justify-center rounded-lg">
// 				{pdfTypes.includes(file.type) && <FileCheck2 className="w-8 h-8 text-primary" />}
// 				{wordTypes.includes(file.type) && <FileText className="w-8 h-8 text-primary" />}
// 				{excelTypes.includes(file.type) && <Sheet className="w-8 h-8 text-primary" />}
// 				{pptTypes.includes(file.type) && <FileChartLine className="w-8 h-8 text-primary" />}
// 			</div>
// 		);
// 	};

// 	const handleSubmit = async (e: FormEvent) => {
// 		e.preventDefault();

// 		setError(null);

// 		if (!file) {
// 			setError('Please select file.');
// 			return;
// 		}

// 		setIsLoading(true);
// 		setUploadStatus(false);

// 		const formData = new FormData();
// 		formData.append('file', file);

// 		try {
// 			// Implement your API here

// 			setTimeout(() => {
// 				setIsLoading(false);
// 				setUploadStatus(true);
// 			}, 1500);
// 		} catch (error) {
// 			setIsLoading(false);
// 			setUploadStatus(false);
// 		}
// 	};

// 	return (
// 		<div className="flex items-center justify-center">
// 			<div className="w-150 mx-auto flex items-center justify-center p-4">
// 				<div className="w-full p-6 rounded-xl shadow-lg">
// 					<h2 className="text-xl text-center font-bold text-foreground mb-4">File Upload</h2>
// 					<form onSubmit={handleSubmit} className="flex flex-col justify-center items-center w-full">
// 						<div
// 							{...getRootProps()}
// 							className={`w-full relative border-2 border-dashed rounded-lg p-4 cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'} ${error ? 'border-destructive bg-destructive/5' : ''} transition-all duration-200 ease-in-out`}>
// 							<input {...getInputProps()} aria-label="File upload" />

// 							{!file && (
// 								<div className="flex flex-col justify-center items-center text-sm">
// 									<CloudUpload className="w-12 h-12 mx-auto text-primary mb-4" />
// 									<p className="text-foreground font-medium text-center mb-2">
// 										Drag & drop your file here, or click to select
// 									</p>
// 									<div className="flex gap-1 text-sm text-center">
// 										<span>Supports</span>
// 										<span className="text-muted-foreground">
// 											JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 5MB)
// 										</span>
// 									</div>
// 								</div>
// 							)}

// 							{file && (
// 								<div className="flex items-start justify-between gap-1">
// 									<div className="flex items-center space-x-4">
// 										{getFilePreview()}
// 										<div className="flex flex-col">
// 											<p className="font-medium text-foreground text-sm">{file.name}</p>
// 											<p className="text-sm text-muted-foreground">
// 												{(file.size / (1024 * 1024)).toFixed(2)} MB
// 											</p>
// 											<div>
// 												{dimensions.width > 0 && (
// 													<p className="text-sm mt-2">
// 														<span>Dimensions: </span>
// 														<span className="text-muted-foreground">{dimensions.width}</span>
// 														<span> x </span>
// 														<span className="text-muted-foreground"> {dimensions.height}</span>
// 														<span> px</span>
// 													</p>
// 												)}
// 											</div>
// 										</div>
// 									</div>
// 									<button
// 										onClick={(e) => {
// 											e.stopPropagation();
// 											removeFile();
// 										}}
// 										color="error"
// 										className="p-2 hover:bg-secondary rounded-full transition-colors"
// 										aria-label="Remove file">
// 										<X className="w-5 h-5 text-error" />
// 									</button>
// 								</div>
// 							)}

// 							{error && (
// 								<div className="mt-4 text-destructive text-sm flex items-center justify-center text-xs">
// 									<TriangleAlert className="w-5 h-5 mr-2" />
// 									{error}
// 								</div>
// 							)}
// 						</div>

// 						<div className="relative mb-1 w-full">
// 							{uploadStatus ? (
// 								<div className="mt-4 flex items-center justify-center">
// 									<Check className="w-5 h-5 mr-2 text-success" />
// 									<span className="text-xs">File Uploaded Successfully</span>
// 								</div>
// 							) : (
// 								<></>
// 							)}
// 						</div>

// 						<button
// 							type="submit"
// 							disabled={!file || !!error || isLoading}
// 							className={`mt-2 py-2 px-4 rounded-lg bg-primary text-white hover:bg-opacity/90 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}>
// 							{isLoading ? <span className="animate-spin mr-2">⌛</span> : <></>}
// 							{isLoading ? 'Uploading...' : 'Upload'}
// 						</button>
// 					</form>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default UploadForm;