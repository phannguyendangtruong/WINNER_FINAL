import React from 'react';
import './bids.css';

import { ArrowBack, ArrowForward } from '@mui/icons-material';
import ItemBid from './ItemBid';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';

const Bids = ({ title, data }) => {
	console.log('===> item data ', data);
	return (
		// <ScrollMenu className='bids'>
		// <ScrollMenu className='bids'>
		<div className='bids'>
			<div className='bids-container'>
				<div className='bids-container-text'>
					<h2>{title}</h2>
				</div>
				<div className='bids-container-card'>
					{data.map((item) => (
						<ItemBid item={item} key={Math.random()} />
					))}
				</div>
			</div>
			<div className='load-more'>
				<div className='boxNumPage'>
					<ArrowBack
						color='white'
						htmlColor='white'
						sx={{ fontSize: 16 }}
						style={{ marginTop: 10, marginLeft: 5 }}
					/>
				</div>
				<div className='boxNumPage'>
					<div className='textBoxPage'>1</div>
				</div>
				<div className='boxNumPage'>
					<div className='textBoxPage'>2</div>
				</div>
				<div className='boxNumPage'>
					<div className='textBoxPage'>3</div>
				</div>
				<div className='boxNumPage'>
					<ArrowForward
						color='white'
						htmlColor='white'
						sx={{ fontSize: 16 }}
						style={{ marginTop: 8, marginLeft: 5 }}
					/>
				</div>
			</div>
		</div>
		// </ScrollMenu>
	);
};

export default Bids;
