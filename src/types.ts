export interface IObjectWithProps {
  [key: string]: Data
}

export type Prop = string | number | boolean | object | null | undefined | IObjectWithProps

export type Data = Prop | Prop[]

export type Path = string

export interface IOperands {
  [key: string]: Data
}

export interface IContext {
  rev: boolean,
  onlyMappedValues: boolean;
}

export interface IDataMapper<TU = Data, TV = Data | boolean> {
  (data: TU, context: IContext): TV
}

export interface ICustomFunction<T = IOperands, TU = Data, TV = Data | boolean> {
  (operands: T): IDataMapper<TU, TV>
}

export interface ICustomFunctions {
  [key: string]: ICustomFunction
}

export interface IState {
  root: Data,
  context: Data,
  value: Data,
  rev?: boolean,
  onlyMapped?: boolean,
  arr?: boolean;
}

export interface IOptions {
  customFunctions?: ICustomFunctions
}

export interface ITransformObject extends IOperands {
  $transform: string
}

export interface IFilterObject extends IOperands {
  $filter: string
}

export type OperationObject = ITransformObject | IFilterObject

export interface IStateMapper {
  (state: IState): IState
}

export interface IOperation {
  (options: IOptions): IStateMapper
}

export interface IMapFunction {
  (options: IOptions): (state: IState) => IState
}

type MapPipeSimple = (IMapObject | IOperation | OperationObject | Path)[]

export type MapPipe = (IMapObject | IOperation | OperationObject | Path | MapPipeSimple)[]

export interface IMapObject {
  [key: string]: MapDefinition | undefined,
  $transform?: undefined,
  $filter?: undefined;
}

export type MapDefinition = IMapObject | IOperation | OperationObject | MapPipe | Path | null

export interface IMapTransformWithOnlyMappedValues {
  (data: Data): Data;
  onlyMappedValues: (data: Data) => Data;
}

export interface IMapTransform extends IMapTransformWithOnlyMappedValues {
  rev: IMapTransformWithOnlyMappedValues
}
