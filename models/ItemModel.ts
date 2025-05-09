class ItemModel{
    
    constructor(
        public id: number,
        public name: string,
        public category: string,
        public price: number,
    ) {}

    static emptyItem(): ItemModel {
        return new ItemModel(0, "", "", 0);
    }
}

export default ItemModel;   