export class CustomerModel {
	id: number;
	name: string;
	address: string;
	contractNumber: number;
	date: string;
	zones: ZoneModel[];
	contact1: ContactModel;
	contact2: ContactModel;
	emergency_contact: ContactModel;
}

export class ContactModel {
	firstName: string;
	lastName: string;
	email: string;
	phoneNumber: number;
}

export class ZoneModel {
	id: number;
	name: string;
	description: string;
	sensors: SensorModel[];
}

export class SensorModel {
	id: number;
	name: string;
	description: string;
	lat: number;
	lng: number;
}