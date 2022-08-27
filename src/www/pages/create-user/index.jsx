import {
	BodyWrapper,
	Container,
	RedIcon,
	Required,
	Title,
	FormItem,
	Wrapper,
	FormWrapper,
} from './create-user.elements';
import {
	Upload,
	InputNumber,
	Form,
	Input,
	Button,
	Select,
	Modal,
	DatePicker,
} from 'antd';

import { client } from '../../utilities/ipfs';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';
import { withContext } from '../../hooks';
import { themes } from '../../assets/themes';
import NotPermistion from '../../components/not-permistion';
import * as XLSX from "xlsx";

const { Option } = Select;
import { useCanister, useConnect } from '@connect2ic/react';

const IPFS_LINK = 'https://dweb.link/ipfs/';

function CreateUser(props) {
	const [fileImg, setFileImg] = useState('');
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const { isConnected, principal } = useConnect();

	// upload image
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');
	const [fileList, setFileList] = useState([]);
	const profile = useRef({ role: 1 });
	const [excel, setExcel] = useState([]);
	const datePicker = useRef('');
	const [allSchool, setAllSchool] = useState([]);

	// when image upload
	useEffect(() => {
		if (fileImg[0]) {
			requestUpdate();
		}
	}, [fileImg]);

	useEffect(async () => {
		if (superheroes && isConnected) {
			await getMyInfor();
		}
	}, [superheroes]);

	const onChangeDate = (date, dateString) => {
		datePicker.current = dateString;
	};

	const getMyInfor = async () => {
		const res = await superheroes.findUserById(Principal.fromText(principal));
		profile.current = res[0];
		const schools = await superheroes.getAllSchool();
		setAllSchool(schools);
	};

	const requestUpdate = () => {
		const resImg = fileList[0].thumbUrl;
		setFileImg(resImg);
	};

	const getBase64 = (file) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = () => resolve(reader.result);

			reader.onerror = (error) => reject(error);
		});

	const onFinish = async (values) => {
		toast('Waiting...!!!');

		const cid = await client.put([fileList[0].originFileObj]);

		const image = `${IPFS_LINK}${cid}/${fileList[0].originFileObj.name}`;

		const res = await superheroes.insertUser(
			Principal.fromText(values?.address),
			values?.username,
			values?.identity + '',
			values?.school,
			datePicker.current,
			image,
			values?.description
		);

		toast('Insert user success!!!');
		window.location.reload();
	};

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

	const onChange = (e) => {
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

	const createUserExcel = async () => {
			toast('Waiting...!!!');
			const arr = excel.split(',');
			console.log(arr);

			for(let i = 3; i < arr.length; i++){
				if(i == 3 || i == 19 || i == 35 || i == 51 || i == 67 || i == 83 || i == 99 || i == 115 || i == 131 || i == 147){
					const walletAddress = arr[i];
					const username = arr[i + 2];
					const cccd = arr[i + 4];
					const school = arr[i + 6];
					const birthday = arr[i + 8];
					const image = arr[i + 10];
					const description = arr[i + 12];
					const res =  await superheroes.insertUser(
						Principal.from(walletAddress),
						username,
						cccd,
						school,
						birthday,
						image,
						description
					);
					console.log("res: " + i + " ", walletAddress, username, cccd, school, birthday, image, description);
					toast(`Insert user success!!!`);
				}
				//window.location.reload();
			}
		}

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

	return Number(profile.current?.role) === 1 ? (
		<NotPermistion />
	) : (
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
						Upload image: Here is a photo of an NFT certified person.
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
						Enter username: this is name of student.
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
						Step 3
					</div>
					<div style={{ color: 'white' }}>
						Enter citizen identity card: This is citizen identity car of
						student.
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
						Step 4
					</div>
					<div style={{ color: 'white' }}>
						Paste public key: This is the wallet address of student.
						{''}
						<a style={{ color: 'blueviolet' }} href='https://plugwallet.ooo/'>
							{' '}
							How to create a wallet
						</a>
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
						Step 5
					</div>
					<div style={{ color: 'white' }}>
						Choose chool: This is school of student.
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
						Step 6
					</div>
					<div style={{ color: 'white' }}>
						Enter description: This is all description about student.
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
						Step 7
					</div>
					<div style={{ color: 'white' }}>
						Choose degree's rating: Student's rating
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
						Step 8
					</div>
					<div style={{ color: 'white' }}>
						Enter birthday: This is birthday of the student.
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
				<div>
					<input type="file" onChange={onChange} />
		   			<button onClick={createUserExcel}>Create</button>
	   			</div>
				<Title style={{ color: 'white' }}>Create Account</Title>
				<Required style={{ color: 'white' }}>
					<RedIcon style={{ color: 'white' }}>*</RedIcon> Required fields
				</Required>

				<BodyWrapper>
					<Form
						name='basic'
						onFinish={onFinish}
						onFinishFailed={onFinishFailed}
						autoComplete='off'>
						<FormWrapper>
							<FormItem>
								<Form.Item name='image'>
									<Upload
										// action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
										listType='picture-card'
										fileList={fileList}
										onPreview={handlePreview}
										onChange={handleChange}
										style={{
											flexDirection: 'row',
											justifyItems: 'center',
											display: 'flex',
										}}>
										{fileList.length >= 8 ? null : uploadButton}
									</Upload>
									<Modal
										visible={previewVisible}
										title={previewTitle}
										footer={null}
										onCancel={handleCancel}
										style={{ width: 700, height: 400 }}>
										<img
											alt='example'
											style={{
												width: '100%',
												height: '100%',
											}}
											src={previewImage}
										/>
									</Modal>
								</Form.Item>
							</FormItem>
							<div style={{ color: 'white', fontSize: 14 }}>Full name</div>
							<Form.Item
								name='username'
								rules={[{ required: true, message: 'Please input username!' }]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input username'
								/>
							</Form.Item>

							<div style={{ color: 'white', fontSize: 14 }}>
								Citizen identity card
							</div>
							<Form.Item name='identity'>
								<InputNumber
									size='large'
									min={100000000}
									max={999999999999}
									placeholder='Please input citizen identity card'
									type={'number'}
									style={{ width: '100%' }}
								/>
							</Form.Item>

							<div style={{ color: 'white', fontSize: 14 }}>Adress wallet</div>
							<Form.Item name='address'>
								<Input size='large' placeholder='Please input address wallet' />
							</Form.Item>

							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}>
								{allSchool.length > 0 ? (
									<Form.Item name='school'>
										<Select
											defaultValue='Choose School'
											size='large'
											style={{
												width: 200,
												marginBottom: 20,
												borderRadius: 10,
											}}>
											{allSchool.map((item) => (
												<Option value={item?.schoolCode}>{item?.name}</Option>
											))}
										</Select>
									</Form.Item>
								) : null}
							</div>

							<div style={{ color: 'white', fontSize: 14 }}>Description</div>
							<Form.Item name='description'>
								<Input size='large' placeholder='Please input description' />
							</Form.Item>

							<div style={{ color: 'white', fontSize: 14 }}>Birthday</div>
							{/* <Input size='large' placeholder='Please input birthday' /> */}
							<DatePicker
								style={{ width: '100%' }}
								onChange={onChangeDate}
								placeholder='Please picke birthday'
							/>

							<FormItem>
								<Form.Item>
									<Button
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
}

export default withContext(CreateUser);
