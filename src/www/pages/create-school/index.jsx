import {
	BodyWrapper,
	Container,
	Title,
	FormItem,
	Wrapper,
	FormWrapper,
} from './create-school.elements';
import { Upload, Modal, Form, Input, Button, Select } from 'antd';

import React, { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';
import { withContext } from '../../hooks';
import { themes } from '../../assets/themes';
import NotPermistion from '../../components/not-permistion';
import { PlusOutlined } from '@ant-design/icons';
import { client } from '../../utilities/ipfs';

const { Option } = Select;
import { useCanister, useConnect } from '@connect2ic/react';

const IPFS_LINK = 'https://dweb.link/ipfs/';

function CreateSchool(props) {
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const { isConnected, principal } = useConnect();
	const [fileList, setFileList] = useState([]);
	const [logoList, setLogoList] = useState([]);
	const [previewVisible, setPreviewVisible] = useState(false);
	const [previewVisibleLogo, setPreviewVisibleLogo] = useState(false);
	const [previewImage, setPreviewImage] = useState('');
	const [previewImageLogo, setPreviewImageLogo] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');
	const [previewTitleLogo, setPreviewTitleLogo] = useState('');
	const profile = useRef({ role: 1 });

	useEffect(async () => {
		if (superheroes && isConnected) {
			await getMyInfor();
		}
	}, [superheroes]);

	const getMyInfor = async () => {
		const res = await superheroes.findUserById(Principal.fromText(principal));
		profile.current = res[0];
	};

	const handleCancel = () => setPreviewVisible(false);

	const handleCancelLogo = () => setPreviewVisibleLogo(false);

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
		const cidlogo = await client.put([logoList[0].originFileObj]);
		const image = `${IPFS_LINK}${cid}/${fileList[0].originFileObj.name}`;
		const logo = `${IPFS_LINK}${cidlogo}/${logoList[0].originFileObj.name}`;
		const res = await superheroes.insertSchool(
			values?.name,
			values?.address,
			values?.schoolCode,
			values?.chairman,
			logo,
			image,
			values?.description
		);

		console.log(res);
		toast('Insert school success!!!');
		window.location.reload();
	};

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

	const handlePreviewLogo = async (file) => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}

		console.log(file);

		setPreviewImageLogo(file.url || file.preview);
		setPreviewVisibleLogo(true);
		setPreviewTitleLogo(
			file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
		);
	};

	const onFinishFailed = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	const uploadButton = (
		<div>
			<PlusOutlined />
			<div
				style={{
					marginTop: 8,
				}}>
				Upload banner
			</div>
		</div>
	);

	const uploadLogo = (
		<div>
			<PlusOutlined />
			<div
				style={{
					marginTop: 8,
				}}>
				Upload logo
			</div>
		</div>
	);

	const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
	const handleChangeLogo = ({ fileList: newLogoList }) => {
		console.log(newLogoList);
		setLogoList(newLogoList);
	};
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
						School Name: This is name of school
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
						Address: This is address of school
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
						School Code: This is code of school
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
						Chairman: This is name of chairman
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
					marginBottom: 40,
				}}>
				<Title style={{ color: 'white' }}>Create School</Title>
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
							<FormItem>
								<Form.Item name='logo'>
									<Upload
										// action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
										listType='picture-card'
										fileList={logoList}
										onPreview={handlePreviewLogo}
										onChange={handleChangeLogo}
										style={{
											flexDirection: 'row',
											justifyItems: 'center',
											display: 'flex',
										}}>
										{logoList?.length >= 8 ? null : uploadLogo}
									</Upload>
									<Modal
										visible={previewVisibleLogo}
										title={previewTitleLogo}
										footer={null}
										onCancel={handleCancelLogo}
										style={{ width: 700, height: 400 }}>
										<img
											alt='example'
											style={{
												width: '100%',
												height: '100%',
											}}
											src={previewImageLogo}
										/>
									</Modal>
								</Form.Item>
							</FormItem>
							<div style={{ color: 'white', fontSize: 14 }}>School Name</div>
							<Form.Item
								name='name'
								rules={[
									{ required: true, message: 'Please input school name!' },
								]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input school name'
								/>
							</Form.Item>
							<div style={{ color: 'white', fontSize: 14 }}>Address</div>
							<Form.Item
								name='address'
								rules={[{ required: true, message: 'Please input address!' }]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input address'
								/>
							</Form.Item>
							<div style={{ color: 'white', fontSize: 14 }}>School Code</div>
							<Form.Item
								name='schoolCode'
								rules={[
									{ required: true, message: 'Please input school code!' },
								]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input school code'
								/>
							</Form.Item>
							<div style={{ color: 'white', fontSize: 14 }}>Chairman</div>
							<Form.Item
								name='chairman'
								rules={[{ required: true, message: 'Please input chairman!' }]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input chairman'
								/>
							</Form.Item>
							<div style={{ color: 'white', fontSize: 14 }}>Description</div>
							<Form.Item
								name='description'
								rules={[
									{ required: true, message: 'Please input description!' },
								]}>
								<Input
									width={'100%'}
									size='large'
									placeholder='Please input chairman'
								/>
							</Form.Item>
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

export default withContext(CreateSchool);
