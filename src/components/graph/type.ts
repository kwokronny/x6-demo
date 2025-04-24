export namespace GraphType {
  export interface NodeData {
    id: string;
    data: any;
  }

  export type TriggerItemsType = {
    newContact: {};
  };

  export type TriggerType = keyof TriggerItemsType;

  export interface CommonTrigger<T extends TriggerType> {
    id: string;
    title: string;
    type: T;
  }

  export type TriggerItem<T extends TriggerType> = T extends TriggerType
    ? TriggerItemsType[T] & CommonTrigger<T>
    : CommonTrigger<T>;

  export interface TriggerNode extends NodeData {
    triggers: TriggerItem<TriggerType>[];
  }
  
  export interface ActionNode extends NodeData {
    data: {
      keyword: string;
    };
  }
}
