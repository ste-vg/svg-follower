import '../styles.scss';
import { Pkg } from "../package";

export class App
{
	constructor()
	{
		console.log('APP STARTED', Pkg().version)
	}
}