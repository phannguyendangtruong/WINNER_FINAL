import React from 'react';
import { themes } from '../../assets/themes';

const container = {
	backgroundColor: themes.colors.background_box,
	height: 400,
	width: '100%',
	alignItems: 'center',
	justifyContent: 'center',
	display: 'flex',
};

const testTitle = {
	fontSize: 20,
	fontWeight: 'bold',
	fontFamily: 'sans-serif',
	color: 'white',
	margin: 'auto',
};

function NotPermistion() {
	return (
		<div style={container}>
			<div style={testTitle}>You don't have permistion to access this</div>
		</div>
	);
}

export default NotPermistion;
