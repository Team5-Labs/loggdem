// Logger.ts
import { Container, ContainerInstance, Service, Inject } from 'typedi';
import { ConsoleLogger } from './console';
import { loggdem } from './logger';

export function consoleLogger(options?: any) {
  return function (object: any, propertyName: string, index: any) {
    const logger = new ConsoleLogger();
    Container.registerHandler({ object, propertyName, index, value: ContainerInstance => logger });
  };
}

export function Logger(options?: any) {
  return function (object: any, propertyName: string, index: any) {
    const logger = new loggdem;
    Container.registerHandler({ object, propertyName, index, value: ContainerInstance => logger });
  };
}




