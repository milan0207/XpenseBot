import ItemModel from "./ItemModel";

class ReceitpModel {
  createdAt: any;
  constructor(
    public id: string,
    public store_name: string,
    public date: Date,
    public total_amount: number,
    public currency: string,
    public items: Array<ItemModel>
  ) {}
}

export default ReceitpModel;