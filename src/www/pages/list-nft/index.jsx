import React, { useEffect, useState, useRef } from 'react';
import NftItem from '../../components/nft-item';
import { Container } from './list-nft.elements';
import { customAxios } from '../../utils/custom-axios';
import { useCanister, useConnect } from '@connect2ic/react';
import './index.css';
import Bids from '../../components/bids/Bids';
import { Principal } from '@dfinity/principal';
import { toast } from 'react-toastify';

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

function ListNft() {
	const {
		isConnected,
		disconnect,
		activeProvider,
		isIdle,
		connect,
		isConnecting,
		principal,
	} = useConnect();
	const [listDiploma, setListDiploma] = useState([]);
	const [listCertificate, setListCertificate] = useState([]);
	const [listOther, setListOther] = useState([]);
	const [search, setSearch] = useState('');
	const [searchNfts, setNftsSearch] = useState('');
	const listAll = useRef([]);

	const [superheroes, { loading, error }] = useCanister('superheroes');
	useEffect(() => {
		if (superheroes) {
			getListAll();
		}
	}, [superheroes]);

	const findSearch = (e) => {
		const keyword = e.target.value;
		const test = listAll.current;
		if (keyword.length > 0) {
			let listSearch = test.filter((item) => item.name.includes(keyword));

			console.log('listSearch 1 ', listSearch);

			if (listSearch.length === 0) {
				listSearch = test.filter(
					(item) =>
						Principal.fromUint8Array(item.owner._arr).toString() ==
						keyword.toString()
				);
			}

			setNftsSearch(listSearch);
		} else {
			setNftsSearch(listAll.current);
		}
		setSearch(keyword);
	};

	const getListAll = async () => {
		const res = await superheroes.getAllTokens();
		console.log('====> ', res);
		const promise4all = Promise.all(
			res.map(async (el) => {
				try {
					const res = await customAxios(el.metadata[0]?.tokenUri);
					return res;
				} catch (e) {
					return {};
				}
			})
		);
		const resu = await promise4all;
		// const resu = [await customAxios(res[].metadata[0]?.tokenUri)];


		const newlist = res.map((el, index) => {
			try {
				return { ...el, ...resu[index] };
			} catch (e) {
				return null;
			}
		});

		listAll.current = newlist;
		setListDiploma(newlist.filter((el) => el.category === '1'));
		setListCertificate(newlist.filter((el) => el.category === '2'));
		setListOther(newlist.filter((el) => el.category === '3'));
	};

	const renderList = (list, title) => {
		return list.length > 0 ? (
			<Bids title={title} data={list} key={Math.random()} />
		) : null;
	};

	return (
		<div className='container'>
			<div style={textTitle}>See All NFT On The World</div>
			<div style={textDay}>{formatDate(new Date())}</div>

			<input
				value={search}
				onChange={findSearch}
				type='text'
				placeholder='Search by address wallet and name degress'
			/>
			{search.length > 0
				? renderList(searchNfts, 'Other')
				: [
						renderList(listDiploma, 'Diploma'),
						renderList(listCertificate, 'Certificate'),
						renderList(listOther, 'Other'),
				  ]}
		</div>
	);
}

const textTitle = {
	textAlign: 'center',
	fontSize: 25,
	fontWeight: 'bold',
	color: 'white',
	paddingTop: 60,
};

const textDay = {
	textAlign: 'center',
	fontSize: 15,
	color: 'gray',
	marginBottom: 60,
};

export default ListNft;
