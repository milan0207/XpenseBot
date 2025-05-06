import ItemModel from "./ItemModel";

class ReceitpModel {
  constructor(
    public id: number,
    public store_name: string,
    public date: string,
    public total_amount: number,
    public currency: string,
    public items: Array<ItemModel>
  ) {}
}

export default ReceitpModel;