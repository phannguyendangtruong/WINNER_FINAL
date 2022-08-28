import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';
import { themes } from '../../assets/themes';
import { Link } from 'react-router-dom';
import { useCanister, useConnect } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';
import { Input } from 'antd';
import { AiOutlineSearch } from 'react-icons/ai';

const { Search } = Input;

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

const Ranking = () => {
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const [users, setUsers] = useState([]);
	const [usersSearch, setUsersSearch] = useState([]);
	const [search, setSearch] = useState('');
	const allSchool = useRef([]);
	const itemSchool = useRef();

	const {
		isConnected,
		disconnect,
		activeProvider,
		isIdle,
		connect,
		isConnecting,
		principal,
	} = useConnect();

	const getSchool = (_value) => {
		// switch (_value) {
		// 	case 1:
		// 		return 'FPT POLYTECHNIC';
		// 	case 2:
		// 		return 'FPT UNIVERSITY';
		// 	case 3:
		// 		return 'UNI OF GREENWICH';
		// 	default:
		// 		return 'FPT POLYTECHNIC';
		// }

		if (_value) {
			if (allSchool.current.length > 0) {
				const nameSchool = allSchool.current.filter(
					(_item) => _item.schoolCode == _value
				)[0];

				return nameSchool?.name;
			} else {
				return '';
			}
		} else return '';
	};

	const findSearch = (e) => {
		// const keyword = e.target.value;
		console.log('====> all users ', users);
		setUsersSearch(users);

		const test = users;
		if (e.target.value.length > 0) {
			let listSearch = [];

			try {
				if (listSearch.length === 0) {
					listSearch = test.filter(
						(item) =>
							Principal.fromUint8Array(item.walletAddress._arr).toString() ==
							e.target.value.toString()
					);
				}
			} catch (e) {}

			if (listSearch.length === 0)
				listSearch = test.filter(
					(item) =>
						item.username.includes(e.target.value) ||
						item.cccd.includes(e.target.value)
				);

			setUsersSearch(listSearch);
		} else {
			setUsersSearch(users);
		}

		setSearch(e.target.value);
	};

	useEffect(async () => {
		if (superheroes) {
			getUsers();
		}
	}, [superheroes]);

	const EvaluateRank = (user) => {
		return Promise.all(
			user.map(async (item) => {
				try {
					const res = await superheroes.getUserTokens(item.walletAddress);
					return { ...item, sumDegree: res.length };
				} catch (e) {
					return null;
				}
			})
		);
	};

	const getUsers = async () => {
		try {
			const res = await superheroes.getAllUser();
			const newRank = await EvaluateRank(res);

			newRank.sort((a, b) => b.sumDegree - a.sumDegree);
			setUsersSearch(newRank);

			setUsers(newRank);

			const schools = await superheroes.getAllSchool();
			allSchool.current = schools;
		} catch (error) {
			console.log('[getUsers] error', error);
		}
	};

	const setInitial = useCallback(() => {
		// setSearch('');
		// console.log('---------------------');
		// console.log('=== usersRemain ', usersRemain);
		// console.log('=== usersSearch ', usersSearch);
		// console.log('=== users ', users);
		// console.log('=== search ', search);
	});

	const ItemRank = ({ item, index }) => {
		const address = Principal.fromUint8Array(
			item.walletAddress._arr
		).toString();
		return (
			<Link to={`/profile/${item.walletAddress}`}>
				<div style={containerBottomRank}>
					<div className='boxTopBottom' style={boxTopBottom}>
						<div style={row}>
							<div
								style={{
									width: '5%',
									fontWeight: 'bold',
									fontSize: 12,
									color: 'white',
									marginRight: 10,
								}}>
								{index + 4}
							</div>
							<div
								style={{
									width: '10%',
									flex: 1,
									alignSelf: 'center',
								}}>
								<img style={{ objectFit: 'cover' }} src={item.image} />
							</div>

							<div
								style={{
									width: 320,
									fontWeight: 'bold',
									fontSize: 12,
									color: 'white',
									flex: 1,
									alignSelf: 'center',
								}}>
								{item.username}
							</div>
						</div>
						<div
							style={{
								width: 120,
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								flex: 1,
								alignSelf: 'center',
								marginLeft: 40,
							}}>
							{getSchool(item.school)}
						</div>
						<div
							style={{
								width: '15%',
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								flex: 1,
								alignSelf: 'center',
								marginLeft: 130,
							}}>
							{item.sumDegree}
						</div>
						<div
							style={{
								width: '30%',
								fontWeight: 'bold',
								fontSize: 12,
								color: 'white',
								flex: 1,
								alignSelf: 'center',
							}}>
							{address.slice(0, 20) +
								'...' +
								address.slice(address.length - 20, address.length - 1)}
						</div>
					</div>
				</div>
			</Link>
		);
	};

	const renderListTop = () => {
		const data = users.slice(0, 3);

		return (
			<div style={rowTop}>
				{data?.map((item, index) => (
					<Link key={Math.random()} to={`/profile/${item.walletAddress}`}>
						<div className='boxTop' style={boxTop}>
							<img src={item?.image} />
							<div>{item?.username}</div>
							<p style={{ fontSize: 10, color: 'gray' }}>
								{getSchool(item?.school)}
							</p>
							<p style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
								<span style={{ fontWeight: 'normal' }}> Sum degree</span>{' '}
								{item?.sumDegree}
							</p>
							<p style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
								<span style={{ fontWeight: 'normal' }}> Top ranking</span>{' '}
								{index + 1}
							</p>
						</div>
					</Link>
				))}
			</div>
		);
	};

	return (
		<div className='profile section__padding'>
			<div style={textTitle}>Top Rank Students</div>
			<div style={textDay}>{formatDate(new Date())}</div>

			{renderListTop()}

			<div style={containerBottomRank} key={Math.random()}>
				<div
					className='boxTopBottom'
					style={{
						width: '100%',
						// justifyContent: 'space-between',
						display: 'flex',
						flexDirection: 'row',
						justifyItems: 'center',
						alignItems: 'center',
					}}>
					<input
						onChange={findSearch}
						value={search.current}
						type='text'
						placeholder='Search by address wallet, citizen identification'
					/>

					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							paddingLeft: 70,
						}}>
						{' '}
						School
					</div>
					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							paddingLeft: 270,
						}}>
						{' '}
						Sum degree
					</div>
					<div
						style={{
							fontWeight: 'bold',
							fontSize: 12,
							color: 'white',
							paddingLeft: 250,
						}}>
						{' '}
						Address wallet
					</div>
				</div>
			</div>

			{search.length === 0
				? users?.slice(3, usersSearch.length)?.map((item, index) => {
						return <ItemRank item={item} index={index} key={Math.random()} />;
				  })
				: usersSearch?.map((item, index) => {
						return <ItemRank item={item} index={index} key={Math.random()} />;
				  })}
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

const iconClear = {
	marginLeft: -45,
};

const iconFind = {
	marginRight: -30,
	zIndex: 100,
};
export default Ranking;
