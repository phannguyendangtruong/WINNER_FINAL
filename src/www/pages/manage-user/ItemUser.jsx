import React, { useState } from 'react';
import './index.css';
import { themes } from '../../assets/themes';
import { Link } from 'react-router-dom';
import { Principal } from '@dfinity/principal';
import { Switch } from 'antd';
import { useCanister } from '@connect2ic/react';

const getSchool = (_value) => {
	switch (_value) {
		case 1:
			return 'FPT POLYTECHNIC';
		case 2:
			return 'FPT UNIVERSITY';
		case 3:
			return 'UNI OF GREENWICH';
		default:
			return 'FPT POLYTECHNIC';
	}
};

const ItemRank = ({ item, index }) => {
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const [isSwitch, setIsSwitch] = useState(Number(item.role) === 2);

	const onChange = async (checked) => {
		setIsSwitch(!isSwitch);
		const res = await superheroes.updateUser(
			item?.walletAddress,
			item.username,
			item.cccd,
			item.school,
			item.birthday,
			item.image,
			item.description,
			checked === true ? 2 : 1
		);
	};
	return (
		<div style={containerBottomRank}>
			<div className='boxTopBottom' style={boxTopBottom}>
				<div style={row}>
					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							marginRight: 30,
						}}>
						{index + 1}
					</div>
					<img src={item.image} />

					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							marginLeft: 10,
						}}>
						{item.username}
					</div>
				</div>
				<div
					style={{
						fontWeight: 'bold',
						fontSize: 12,
						color: 'white',
						flex: 2,
						alignSelf: 'center',
					}}>
					{getSchool(Number(item.school))}
				</div>

				<div style={{ flex: 1 }}>
					<Link to={`/profile/${item.walletAddress}`}>
						<div
							style={{
								fontSize: 12,
								color: 'black',
								backgroundColor: 'white',
								borderRadius: 10,
								paddingLeft: 10,
								paddingRight: 10,
								paddingTop: 5,
								paddingBottom: 5,
								width: 100,
								alignSelf: 'center',
								justifySelf: 'center',
							}}>
							More
						</div>
					</Link>
				</div>

				<div
					style={{
						flex: 0.5,
						display: 'flex',
						direction: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
					<Switch
						defaultChecked={Number(item?.role) === 2}
						onChange={onChange}
					/>
					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							marginLeft: 10,
							width: 70,
						}}>
						{isSwitch ? 'Manage' : 'User'}
					</div>
				</div>
			</div>
		</div>
	);
};

const textTitle = {
	textAlign: 'center',
	fontSize: 25,
	fontWeight: 'bold',
	color: 'white',
	paddingTop: 40,
};

const textDay = {
	textAlign: 'center',
	fontSize: 15,
	color: 'gray',
	marginBottom: 40,
};

const rowTop = {
	display: 'flex',
	flexDirection: 'row',
	margin: 'auto',
	width: '50%',
	justifyContent: 'space-between',
	marginBottom: 20,
};

const boxTop = {
	backgroundColor: themes.colors.background_box,
	borderRadius: 10,
	padding: 20,
	alignItems: 'center',
	justifyContent: 'center',
	marginHorizontal: 10,
	width: 200,
};

const boxTopBottom = {
	backgroundColor: themes.colors.background_box,
	borderRadius: 10,
	padding: 20,
	marginHorizontal: 10,
	width: '100%',
	display: 'flex',
	flexDirection: 'row',
	// justifyContent: 'space-between',
	flex: 1,
};

const containerBottomRank = {
	width: '90%',
	margin: 'auto',
	marginTop: 20,
};

const row = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'flex-start',
	flex: 2,
};
export default ItemRank;
