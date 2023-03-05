export class ResponseMessage {
  private data: any | any[];
  private code: number;
  private msg: string;

  public success(): ResponseMessage {
    this.code = 200;
    this.msg = '요청이 성공했습니다.';
    return this;
  }

  public error(code: number, data = 'Error', msg: string): ResponseMessage {
    this.code = code;
    this.data = { data };
    this.msg = msg;
    return this;
  }

  public body(data: any | any[] = ''): ResponseMessage {
    this.data = data;
    return this;
  }

  get Data(): any | any[] {
    return this.data;
  }

  get Code(): any | any[] {
    return this.code;
  }

  get Msg(): any | any[] {
    return this.msg;
  }

  public build(): ResponseData {
    return new ResponseData(this);
  }
}

export class ResponseData {
  data: any | any[];
  code: number;
  msg: string;

  constructor(message: ResponseMessage) {
    this.data = message.Data;
    this.code = message.Code;
    this.msg = message.Msg;
  }
}
