import PsqlFilesExecutor from "../PsqlFilesExecutor";

jest.mock('../Utils/PsqlUtils/PsqlToolRunner');
jest.mock('../FileListCreator/FileListCreator');

let psqlFilesExecutor: PsqlFilesExecutor;

beforeAll(() => {
    psqlFilesExecutor = PsqlFilesExecutor.getPsqlFilesExecutor('connString','filePath','args');
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Testing PsqlFilesExecutor', () => {
    let executeSpy: any;
    beforeEach(() => {
        executeSpy = jest.spyOn(psqlFilesExecutor, 'execute');
    });

    test('execute should pass', async () => {
        executeSpy.mockImplementationOnce(() => Promise.resolve());
        await psqlFilesExecutor.execute();
        expect(executeSpy).toHaveBeenCalled();
    });
    
});