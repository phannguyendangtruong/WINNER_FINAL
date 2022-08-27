import React, { useState, useEffect, useRef } from 'react';
import './bids.css';

import { Link } from 'react-router-dom';
import { useCanister, useConnect } from '@connect2ic/react';

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

const ItemBid = ({ item }) => {
	const [superheroes, { loading, error }] = useCanister('superheroes');
	const [profile, setProfile] = useState();

	useEffect(() => {
		getMyInfor();
	}, [superheroes]);

	const getMyInfor = async () => {
		const res = await superheroes.findUserById(item.owner);
		setProfile(res[0]);
	};

	return (
		<div className='card-column'>
			<Link
				to={`/nft/${item.index}`}
				params={item}
				style={{ justifiContent: 'center', alignItems: 'center' }}>
				<div className='bids-card'>
					<div className='bids-card-top'>
						<img src={item.image} alt='' />
						<p
							className='bids-title'
							style={{ fontSize: 18, textAlign: 'center' }}>
							{item.name}
						</p>

						<div className='row1' style={{ justifyContent: 'space-between' }}>
							<div className='row1'>
								<img className='imgAvatar' src={profile?.image} alt='' />

								<p style={{ marginLeft: 10 }} className='bids-title'>
									{profile?.username}
								</p>
							</div>

							<p className='bids-title' style={{ fontSize: 12 }}>
								Rating {item.rating}
							</p>
						</div>
					</div>
					<div className='bids-card-bottom'>
						<p>{getSchool(Number(item.school))}</p>
						<p>{formatDate(item.timeCreate)}</p>
					</div>
				</div>
			</Link>
		</div>
	);
};

export default ItemBid;
