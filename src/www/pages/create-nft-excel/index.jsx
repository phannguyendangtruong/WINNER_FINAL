import {
	BodyWrapper,
	Container,
	RedIcon,
	Required,
	Title,
	FormItem,
	Wrapper,
	FormWrapper,
} from './create-nft-excel.elements';
import { Upload, Form, Input, Button, Select, Modal } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react';
import { client } from '../../utilities/ipfs';
import { Principal } from '@dfinity/principal';
import { customAxios } from '../../utils/custom-axios';
import { toast } from 'react-toastify';
import { withContext } from '../../hooks';
import { themes } from '../../assets/themes';
import { File } from 'nft.storage';
import NotPermistion from '../../components/not-permistion';
import * as XLSX from "xlsx";
import './create-nft-excel.css';

const { Option } = Select;
import { useCanister, useConnect } from '@connect2ic/react';

const IPFS_LINK = 'https://dweb.link/ipfs/';

function CreateNftExcel(props) {
	const { principal } = useConnect();
	const [fileImg, setFileImg] = useState('');
	const profile = useRef({ role: 1 });
	const [allSchool, setAllSchool] = useState([]);
	const [excel, setExcel] = useState([]);
	const [superheroes, { loading, error }] = useCanister('superheroes');

	// upload image

	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');
	const [fileList, setFileList] = useState([]);

	// when image upload
	useEffect(() => {
		if (fileImg[0]) {
			requestUpdate();
		}
	}, [fileImg]);

	const requestUpdate = () => {
		const resImg = fileList[0].thumbUrl;
		setFileImg(resImg);
	};

	const getMyInfor = async () => {
		const res = await superheroes.findUserById(Principal.fromText(principal));
		const schools = await superheroes.getAllSchool();
		setAllSchool(schools);
		profile.current = res[0];
	};

	const getBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = () => resolve(reader.result);

			reader.onerror = (error) => reject(error);
		});

	useEffect(async () => {
		if (principal && superheroes) {
			await getMyInfor();
		}
	}, [principal, superheroes]);
	
	const onFinish = async (values) => {
		toast('Minting NFT!!!');

		if(values?.address == undefined){
		}else{
			const nFile = new File(
				[
					JSON.stringify({
						description: values?.description,
						name: values?.name,
						category: values?.category,
						school: values?.school,
						rating: values?.rating,
						chairman: values?.chairman,
						image: values?.image,
						timeCreate: Date.now(),
					}),
				],
				`${values?.name}.json`,
				{ type: 'text/plain' }
			);
			const metadataCID = await client.put([nFile]);

			const res = await superheroes.mint(Principal.fromText(values?.address), [
				{ tokenUri: `${IPFS_LINK}${metadataCID}/${values?.name}.json` },
			]);
			console.log('==== mint ', res);
			toast('Minted NFT success!!!');
		}

		//window.location.reload();
	};

	const onChange = (e) => {
		var fileName = e.target.files[0].name;
		document.getElementById('fileName').innerHTML = fileName;

		const [file] = e.target.files;
		const reader = new FileReader();

		reader.onload = (evt) => {
			const bstr = evt.target.result;
			const wb = XLSX.read(bstr, { type: "binary" });
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			const data = XLSX.utils.sheet_to_html(ws, { header: 1 });
			let csv = data.replace(/<[^>]*>?/gm, ',');
			setExcel(csv);
		};
		reader.readAsBinaryString(file);
  	};

	  const createNFTExcel = async () => {
		toast('Waiting...!!!');
		const arr = excel.split(',');

		for(let i = 3; i < arr.length; i++){
			if(i == 3 || i == 21 || i == 39 || i == 57 || i == 75 || i == 93 || i == 117 || i == 135 || i == 143){
				const address = arr[i];
				const name = arr[i + 2];
				const category = arr[i + 4];
				const school = arr[i + 6];
				const rating = arr[i + 8];
				const chairman = arr[i + 10];
				const image = arr[i + 12];
				const description = arr[i + 14];

				const values = {
					address,
					description,
					name,
					category,
					school,
					rating,
					chairman,
					image,
				}

				//console.log("==== values ", address, name, category, school, rating, chairman, image, description);
				const get = allSchool.find(school => school.schoolCode === values.school);
				console.log("==== get ", get?.schoolCode);
				console.log("==== values ", values);
				if(get?.schoolCode == values.school){	
					await onFinish(values);
				}else{
					toast('School not found!!!');
				}
			}
			// window.location.reload();
		}
	}

	const onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	const handleCancel = () => setPreviewVisible(false);

	const handlePreview = async (file) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}

		setPreviewImage(file.url || file.preview);
		setPreviewVisible(true);
		setPreviewTitle(
			file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
		);
	};

	const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

	const uploadButton = (
		<div>
			<PlusOutlined />
			<div
				style={{
					marginTop: 8,
				}}>
				Upload image
			</div>
		</div>
	);

	const renderMain = () => {
		return (
			<Container
				style={{ backgroundColor: themes.colors.background, paddingTop: 50 }}>
				<Wrapper
					style={{
						backgroundColor: themes.colors.background_box,
						borderRadius: 15,
						margin: 'auto',
						width: '30%',
						padding: 20,
						marginTop: 20,
					}}>
					<div style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>
						User manual
					</div>
					<div
						style={{
							backgroundColor: themes.colors.background,
							borderRadius: 10,
							padding: 10,
							marginTop: 20,
						}}>
						<div style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
							Step 1
						</div>
						<div style={{ color: 'white' }}>
							Upload Excel: This is an excel file uploaded from the computer.
						</div>
					</div>

					<div
					style={{
						backgroundColor: themes.colors.background,
						borderRadius: 10,
						padding: 10,
						marginTop: 20,
					}}>
					<div style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
						Step 2
					</div>
					<div style={{ color: 'white' }}>
						Submit: After entering, will press send
					</div>
				</div>
				</Wrapper>
				<Wrapper
					style={{
						backgroundColor: themes.colors.background_box,
						borderRadius: 15,
						margin: 'auto',
						width: '50%',
						padding: 20,
						marginBottom: 50,
					}}>
					
					<Title style={{ color: 'white' }}>Create Degree NFT Excel</Title>
					<BodyWrapper>
							<Form
								name='basic'
								onFinish={onFinish}
								onFinishFailed={onFinishFailed}
								autoComplete='off'>
								<FormWrapper>
									<FormItem>
										<Form.Item >
											<div className="file-input">
												<input
												type="file"
												name="file-input"
												id="file-input"
												className="file-input__input" onChange={onChange}
												/>
												<label className="file-input__label" for="file-input">
												<svg
													aria-hidden="true"
													focusable="false"
													data-prefix="fas"
													data-icon="upload"
													className="svg-inline--fa fa-upload fa-w-16"
													role="img"
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 512 512">
													<path fill="currentColor" d="M296 384h-80c-13.3 0-24-10.7-24-24V192h-87.7c-17.8 0-26.7-21.5-14.1-34.1L242.3 5.7c7.5-7.5 19.8-7.5 27.3 0l152.2 152.2c12.6 12.6 3.7 34.1-14.1 34.1H320v168c0 13.3-10.7 24-24 24zm216-8v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h136v8c0 30.9 25.1 56 56 56h80c30.9 0 56-25.1 56-56v-8h136c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path>
												</svg>
												<span id='fileName'>Upload file</span></label>
											</div>
										</Form.Item>
									</FormItem>

									<FormItem>
										<Form.Item>
											<Button
												onClick={createNFTExcel}
												type='primary'
												htmlType='submit'
												size='large'
												style={{ width: 200, marginTop: 20 }}>
												Submit
											</Button>
										</Form.Item>
									</FormItem>
								</FormWrapper>
							</Form>
					</BodyWrapper>
				</Wrapper>
			</Container>
		);
	};

	return Number(profile.current?.role) !== 1 ? renderMain() : <NotPermistion />;
}

export default withContext(CreateNftExcel);
