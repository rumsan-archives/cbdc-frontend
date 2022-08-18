import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { Pie } from 'react-chartjs-2';

import { ExportToExcel } from '../../global/ExportToExcel';
import { formatBalanceAndCurrency } from '../../../utils';

let _data = [];
let _labels = [];

let pieData = {
	labels: _labels,
	datasets: [
		{
			data: _data,
			pointRadius: 1,
			pointHitRadius: 10,
			backgroundColor: ['#245064', '#80D5AA', '#F49786', '#F7C087', '#2b7ec1', '#fb6340', '#527855'],
			hoverBackgroundColor: ['#245064', '#80D5AA', '#F49786', '#F7C087', '#2b7ec1', '#fb6340', '#527855'],
			hoverOffset: 100
		}
	]
};

export default function Index(props) {
	const { releasedToken, redeemedTokens, data, exportData } = props;

	if (data && data.length) {
		_labels = [];
		_data = [];
		for (let d of data) {
			_labels.push(d.name);
			_data.push(d.count);
		}
		pieData.labels = _labels;
		pieData.datasets[0].data = _data;
	}

	return (
		<div>
			<Card>
				<div className="card-body">
					<span className="custom-label">CBDC Pool</span>
					<br />
					<div className="mt-3">
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<h2 style={{ flexBasis: '75%' }} className="card-font-medium">
								{formatBalanceAndCurrency(releasedToken)}
								<p className="token-label">Allocated</p>
							</h2>
							<div className="flex"></div>
							<div className="flex-item v-border"></div>
							<h2 style={{ flexBasis: '25%' }} className="card-font-medium">
								{formatBalanceAndCurrency(redeemedTokens)}
								<p className="token-label">Remaining</p>
							</h2>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
