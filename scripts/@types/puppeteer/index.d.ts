import puppeteer from 'puppeteer';

declare module "puppeteer" {
    interface Mouse extends puppeteer.Mouse {
        wheel(options?: {
            deltaX?: number;
            deltaY?: number;
        }): Promise<void>;
    }
} 