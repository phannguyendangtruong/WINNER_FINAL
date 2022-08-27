import React, { useEffect, useState, useRef } from 'react';
import './item.css';
import { customAxios } from '../../utils/custom-axios';
import { useCanister, useConnect } from '@connect2ic/react';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';

// const 	 = (_value) => {
// 	switch (_value) {
// 		case 1:
// 			return 'FPT POLYTECHNIC';
// 		case 2:
// 			return 'FPT UNIVERSITY';
// 		case 3:
// 			return 'UNI OF GREENWICH';
// 		default:
// 			return 'FPT POLYTECHNIC';
// 	}
// };

// const getLogoSchool = (_value) => {
// 	switch (_value) {
// 		case 1:
// 			return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/FPT_Polytechnic.png/1200px-FPT_Polytechnic.png';
// 		case 2:
// 			return 'https://cdn.haitrieu.com/wp-content/uploads/2021/10/Logo-Dai-hoc-FPT.png';
// 		case 3:
// 			return 'https://d201g1c8t1ay3d.cloudfront.net/wp-content/uploads/2019/10/University-of-Greenwich-logo.jpg';
// 		default:
// 			return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/FPT_Polytechnic.png/1200px-FPT_Polytechnic.png';
// 	}
// };

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

const Index = () => {
	const {
		isConnected,
		disconnect,
		activeProvider,
		isIdle,
		connect,
		isConnecting,
		principal,
	} = useConnect();
	const [nft, setNft] = useState([]);
	const [profile, setProfile] = useState();
	const [isOwner, setIsOwner] = useState(false);
	const [addressTransfer, setAddressTransfer] = useState();
	const [allSchool, setAllSchool] = useState([]);

	const [superheroes, { loading, error }] = useCanister('superheroes');
	useEffect(async () => {
		if (superheroes) {
			getListAll();
		}
	}, [superheroes]);

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
			const nameSchool = allSchool.filter(
				(_item) => _item.schoolCode == _value
			)[0];

			return nameSchool.name;
		} else return 'Loading...';
	};

	const getLogoSchool = (_value) => {
		if (_value) {
			const nameSchool = allSchool.filter(
				(_item) => _item.schoolCode == _value
			)[0];

			return nameSchool?.logo;
		} else return 'Loading...';
	};

	const desc = location.pathname.split('/')[2];

	const getListAll = async () => {
		const res = await superheroes.getAllTokens();
		const detailNft = res.find((item) => Number(item.index) == desc);
		const promise = customAxios(detailNft.metadata[0]?.tokenUri);
		const resu = await promise;

		getMyInfor(detailNft.owner);
		setNft(resu);
		setIsOwner(
			Principal.fromUint8Array(detailNft.owner._arr).toString() === principal
		);
		const schools = await superheroes.getAllSchool();
		setAllSchool(schools);
	};

	const getMyInfor = async (_id) => {
		const res = await superheroes.findUserById(_id);
		setProfile(res[0]);
	};

	const transferToken = async () => {
		try {
			const res = await superheroes.transfer(
				Principal.fromText(addressTransfer),
				BigInt(desc)
			);
			if (res) {
				toast('Send Nft success!');
			} else {
				toast('Send NFT failed!');
			}
		} catch (e) {
			toast('Address wallet not available!');
		}
	};

	return (
		<div className='item section__padding'>
			<div className='item-image'>
				<img src={nft?.image} alt='item' />
			</div>
			<div className='item-content'>
				<div className='item-content-title'>
					<h1>{nft?.name}</h1>
					<p>
						<span>Summer september</span> ‧ {formatDate(nft?.timeCreate)}
					</p>
				</div>
				<div
					className='row1'
					style={{ justifyContent: 'space-between', width: '100%' }}>
					<div className='item-content-creator'>
						<div>
							<p>Owner</p>
						</div>
						<div>
							<img src={profile?.image} alt='creator' />
							<p> {profile?.username} </p>
						</div>
					</div>

					<div className='item-content-certification'>
						<div>
							<p>Certification by</p>
						</div>
						<img src={getLogoSchool(profile?.school)} alt='creator' />
						<p>{allSchool.length > 0 ? getSchool(profile?.school) : ''}</p>
					</div>
				</div>
				<div className='item-content-detail'>
					<p>Description</p>

					<p>{profile?.description}</p>
				</div>
				<div
					className='item-content-detail'
					style={{ flexDirection: 'row', display: 'flex' }}>
					<div className='box-more'>
						<div style={{ margin: 10 }}>GPA 3.8</div>
					</div>
					<div className='box-more'>
						<div style={{ margin: 10 }}>TOP 25</div>
					</div>
				</div>

				{isOwner === true ? (
					<div
						className='item-content-detail'
						style={{ flexDirection: 'row', display: 'flex' }}>
						<div
							style={{
								padding: 5,
								backgroundColor: 'white',
								borderRadius: 10,
								width: 170,
								alignSelf: 'center',
								justifySelf: 'center',
								paddingTop: 10,
								paddingBottom: 10,
							}}
							onClick={transferToken}>
							{' '}
							Transfer nft
						</div>
						<input
							type='text'
							placeholder='Paste address you want tranfer this nft'
							onChange={(e) => setAddressTransfer(e.target.value)}
							value={addressTransfer}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Index;
