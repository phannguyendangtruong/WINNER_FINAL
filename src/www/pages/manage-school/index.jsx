import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { themes } from '../../assets/themes';
import { useCanister, useConnect } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';
import NotPermistion from '../../components/not-permistion';

import ItemSchool from './ItemSchool';

const formatDate = (_timestamp) => {
	var date = new Date(_timestamp);

	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var min = date.getMinutes();

	month = (month < 10 ? '0' : '') + month;
	day = (day < 10 ? '0' : '') + day;
	hour = (hour < 10 ? '0' : '') + hour;
	min = (min < 10 ? '0' : '') + min;

	var str =
		date.getFullYear() + '/' + month + '/' + day + ' ' + hour + ':' + min;

	return str;
};

const ManageUser = () => {
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const [users, setUsers] = useState([]);
	const [schools, setSchools] = useState([]);
	const [search, setSearch] = useState('');
	const [usersSearch, setUsersSearch] = useState([]);
	const profile = useRef({ role: 1 });
	const {
		isConnected,
		disconnect,
		activeProvider,
		isIdle,
		connect,
		isConnecting,
		principal,
	} = useConnect();

	useEffect(async () => {
		if (superheroes) {
			getMyInfor();
			getSchool();
		}
	}, [superheroes]);

	const getMyInfor = async () => {
		const res = await superheroes.findUserById(Principal.fromText(principal));
		profile.current = res[0];
	};

	const getSchool = async () => {
		try {
			const res = await superheroes.getAllSchool();
			// const filterSchool = res.filter((item) => Number(item.role) != 3);

			console.log('===> ', res);
			setSchools(res);
		} catch (error) {
			console.log('[GetSchool] error', error);
		}
	};

	const findSearch = (e) => {
		const keyword = e.target.value;
		const test = users;
		if (keyword.length > 0) {
			let listSearch = [];

			try {
				if (listSearch.length === 0) {
					listSearch = test.filter(
						(item) =>
							Principal.fromUint8Array(item.walletAddress._arr).toString() ==
							keyword.toString()
					);
				}
			} catch (e) {}

			if (listSearch.length === 0)
				listSearch = test.filter(
					(item) =>
						item.username.includes(keyword) || item.cccd.includes(keyword)
				);

			setUsersSearch(listSearch);
		} else {
			setUsersSearch(users);
		}
		setSearch(keyword);
	};

	const renderMain = () => {
		return (
			<div className='profile section__padding'>
				<div style={textTitle}>Manage all schools</div>
				<div style={textDay}>{formatDate(new Date())}</div>

				<div style={containerBottomRank}>
					<div
						className='boxTopBottom'
						style={{
							width: '100%',
							// justifyContent: 'space-between',
							display: 'flex',
							flexDirection: 'row',
						}}>
						<input
							onChange={findSearch}
							value={search}
							type='text'
							placeholder='Search by address wallet, citizen identification'
						/>
						<div
							style={{
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								paddingLeft: 120,
							}}>
							{' '}
							Address School
						</div>
						<div
							style={{
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								paddingLeft: 150,
							}}>
							{' '}
							School Code
						</div>
						<div
							style={{
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								paddingLeft: 195,
							}}>
							{' '}
							Chairman
						</div>
					</div>
				</div>

				{search.length > 0
					? usersSearch.map((item, index) => {
							return item.role !== 3 ? (
								<ItemSchool item={item} index={index} key={Math.random()} />
							) : null;
					  })
					: schools.map((item, index) => {
							return item.role !== 3 ? (
								<ItemSchool item={item} index={index} key={Math.random()} />
							) : null;
					  })}
			</div>
		);
	};

	return profile.current?.role == 3 ? renderMain() : NotPermistion();
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
	justifyContent: 'space-between',
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
	justifyContent: 'center',
};
export default ManageUser;
