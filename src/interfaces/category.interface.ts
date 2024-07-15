export default interface ICategory {
    slug:string,
	name: string
	description: string
	bannerImage: {
		path:string,
		name:string,
	  };
	  cardImage: {
		path:string,
		name:string,
	  };
	createdAt: Date
	published: boolean
}
