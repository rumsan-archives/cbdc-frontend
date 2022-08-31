import axios from 'axios';
import API from '../constants/api';
import qs from 'query-string';

import { getUserToken } from '../utils/sessionManager';
import CONTRACT from '../constants/contracts';
import {
	getContractByProvider,
} from '../blockchain/abi';

const access_token = getUserToken();

export function deployAgencyToken(agencyId, payload) {
	return new Promise((resolve, reject) => {
		axios
			.post(`${API.AGENCY}/${agencyId}/token`, payload, {
				headers: { access_token: access_token }
			})
			.then(res => {
				if (res.statusText === 'OK') {
					resolve(res.data);
				}
				reject(res.data);
			})
			.catch(err => {
				reject({ statusText: 'FAIL', data: {} });
			});
	});
}

export function getAgencyDetails(agencyId) {
	return new Promise((resolve, reject) => {
		axios
			.get(`${API.AGENCY}/${agencyId}`, {
				headers: { access_token: access_token }
			})
			.then(res => {
				if (res.statusText === 'OK') {
					resolve(res.data);
				}
				reject(res.data);
			})
			.catch(err => {
				reject({ statusText: 'FAIL', data: {} });
			});
	});
}

export function listAgency(query) {
	return new Promise((resolve, reject) => {
		axios
			.get(`${API.AGENCY}?${qs.stringify(query)}`, {
				headers: { access_token: access_token }
			})
			.then(res => {
				if (res.statusText === 'OK') {
					resolve(res.data);
				}
				reject(res.data);
			})
			.catch(err => {
				reject({ statusText: 'FAIL', data: {} });
			});
	});
}

export function approveAgency(agencyId) {
	return new Promise((resolve, reject) => {
		axios
			.patch(
				`${API.AGENCY}/${agencyId}/approve`,
				{},
				{
					headers: { access_token: access_token }
				}
			)
			.then(res => {
				if (res.statusText === 'OK') {
					resolve(res.data);
				}
				reject(res.data);
			})
			.catch(err => {
				reject({ statusText: 'FAIL', data: {} });
			});
	});
}

export async function fetchAllocatedandUsedTokens(tokenAddress,regulaterAddress){
	try{
;	const tokenContract = await getContractByProvider(tokenAddress, CONTRACT.RAHAT_ERC20);
	const supply = await tokenContract.totalSupply();
	const used = await tokenContract.balanceOf(regulaterAddress)
	return {totalAllocated:supply.toNumber(),used:used.toNumber()};
	}
	catch(e){
		console.log(e)
	}

}
