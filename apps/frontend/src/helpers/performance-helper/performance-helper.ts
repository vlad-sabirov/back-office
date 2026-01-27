import { 
	IPerformanceContainer, 
	IPerformanceLogger, IPerformanceMark, 
	IPerformanceShow 
} from "./performance-helper.types";

export class PerformanceHelper {
	private readonly logger: IPerformanceLogger | null = null;
	private lastMark: PerformanceEntry | null = null;

	constructor({ logger, name, message }: IPerformanceContainer) {
		this.logger = logger;
		performance.mark(name);
		if (message) { logger(message); }
	}
	
	mark = ({ name, message }: IPerformanceMark) => {
		performance.mark(name);
		const marks = performance.getEntriesByName(name);
		this.lastMark = marks[marks.length - 1];
		if (message && this.logger) { this.logger(message); }
	}

	show = ({ name, message, prev }: IPerformanceShow) => {
		performance.mark(name);
		const measureName = new Date().getTime().toString();
		performance.measure(measureName, prev ?? this.lastMark?.name, name);
		const duration = performance.getEntriesByName(measureName)[0].duration;
		this.logger?.(`${message} [${duration}ms]`);
	}
}
