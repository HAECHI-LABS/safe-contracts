package henesis;

import io.reactivex.Flowable;
import io.reactivex.functions.Function;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.DynamicBytes;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Type;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 1.4.1.
 */
@SuppressWarnings("rawtypes")
public class GnosisSafeProxyFactory extends Contract {
    public static final String BINARY = "608060405234801561001057600080fd5b50610b22806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c806361b69abd1161005b57806361b69abd146100da578063addacc0f146100ed578063ccc54777146100f5578063d18af54d1461010857600080fd5b80631688f0b9146100825780632500510e146100b257806353e5d935146100c5575b600080fd5b610095610090366004610696565b61011b565b6040516001600160a01b0390911681526020015b60405180910390f35b6100956100c03660046106ef565b610196565b6100cd610226565b6040516100a991906107ca565b6100956100e83660046107e4565b610250565b6100cd6102f9565b610095610103366004610696565b61030b565b610095610116366004610834565b610402565b60006101288484846104d3565b83519091501561014c5760008060008551602087016000865af10361014c57600080fd5b604080516001600160a01b038084168252861660208201527f4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235910160405180910390a19392505050565b60006101da8585858080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508792506104d3915050565b6040516001600160601b0319606083901b16602082015290915060340160408051601f198184030181529082905262461bcd60e51b825261021d916004016107ca565b60405180910390fd5b606060405180602001610238906105c2565b601f1982820381018352601f90910116604052919050565b60008260405161025f906105c2565b6001600160a01b039091168152602001604051809103906000f08015801561028b573d6000803e3d6000fd5b508251909150156102b05760008060008451602086016000865af1036102b057600080fd5b604080516001600160a01b038084168252851660208201527f4f51faf6c4561ff95f067657e43439f0f856d97c04d9ec9070a6199ad418e235910160405180910390a192915050565b606060405180602001610238906105cf565b600080838051906020012083604051602001610331929190918252602082015260400190565b60405160208183030381529060405280519060200120905060006040518060200161035b906105c2565b601f1982820381018352601f90910116604081905261038891906001600160a01b038916906020016108a0565b60405160208183030381529060405290506103f88282308151602092830120604080516001600160f81b03198186015260609390931b6001600160601b03191660218401526035830194909452605580830191909152835180830390910181526075909101909252815191012090565b9695505050505050565b600080838360405160200161042e92919091825260601b6001600160601b031916602082015260340190565b6040516020818303038152906040528051906020012060001c905061045486868361011b565b91506001600160a01b038316156104ca576040516303ca56a360e31b81526001600160a01b03841690631e52b518906104979085908a908a908a906004016108c2565b600060405180830381600087803b1580156104b157600080fd5b505af11580156104c5573d6000803e3d6000fd5b505050505b50949350505050565b6000808380519060200120836040516020016104f9929190918252602082015260400190565b604051602081830303815290604052805190602001209050600060405180602001610523906105c2565b601f1982820381018352601f90910116604081905261055091906001600160a01b038916906020016108a0565b6040516020818303038152906040529050818151826020016000f592506001600160a01b0383166105b95760405162461bcd60e51b815260206004820152601360248201527210dc99585d194c8818d85b1b0819985a5b1959606a1b604482015260640161021d565b50509392505050565b6101728061090083390190565b607b80610a7283390190565b6001600160a01b03811681146105f057600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261061a57600080fd5b813567ffffffffffffffff80821115610635576106356105f3565b604051601f8301601f19908116603f0116810190828211818310171561065d5761065d6105f3565b8160405283815286602085880101111561067657600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000806000606084860312156106ab57600080fd5b83356106b6816105db565b9250602084013567ffffffffffffffff8111156106d257600080fd5b6106de86828701610609565b925050604084013590509250925092565b6000806000806060858703121561070557600080fd5b8435610710816105db565b9350602085013567ffffffffffffffff8082111561072d57600080fd5b818701915087601f83011261074157600080fd5b81358181111561075057600080fd5b88602082850101111561076257600080fd5b95986020929092019750949560400135945092505050565b60005b8381101561079557818101518382015260200161077d565b50506000910152565b600081518084526107b681602086016020860161077a565b601f01601f19169290920160200192915050565b6020815260006107dd602083018461079e565b9392505050565b600080604083850312156107f757600080fd5b8235610802816105db565b9150602083013567ffffffffffffffff81111561081e57600080fd5b61082a85828601610609565b9150509250929050565b6000806000806080858703121561084a57600080fd5b8435610855816105db565b9350602085013567ffffffffffffffff81111561087157600080fd5b61087d87828801610609565b935050604085013591506060850135610895816105db565b939692955090935050565b600083516108b281846020880161077a565b9190910191825250602001919050565b6001600160a01b038581168252841660208201526080604082018190526000906108ee9083018561079e565b90508260608301529594505050505056fe608060405234801561001057600080fd5b5060405161017238038061017283398101604081905261002f916100b9565b6001600160a01b0381166100945760405162461bcd60e51b815260206004820152602260248201527f496e76616c69642073696e676c65746f6e20616464726573732070726f766964604482015261195960f21b606482015260840160405180910390fd5b600080546001600160a01b0319166001600160a01b03929092169190911790556100e9565b6000602082840312156100cb57600080fd5b81516001600160a01b03811681146100e257600080fd5b9392505050565b607b806100f76000396000f3fe6080604052600080546001600160a01b0316632cf35bc960e11b823501602757808252602082f35b3682833781823684845af490503d82833e806040573d82fd5b503d81f3fea2646970667358221220f98520a1f922fdb5dfa8ef4ae25f72be8093ec8b0ec708f95d4a639b493a3e4064736f6c634300081100336080604052600080546001600160a01b0316632cf35bc960e11b823501602757808252602082f35b3682833781823684845af490503d82833e806040573d82fd5b503d81f3fea2646970667358221220f98520a1f922fdb5dfa8ef4ae25f72be8093ec8b0ec708f95d4a639b493a3e4064736f6c63430008110033a264697066735822122046808fd3b26ba56a822b29ec9af17a500c603d474532534aba9925654b2f478264736f6c63430008110033";

    public static final String FUNC_CALCULATECREATEPROXYWITHNONCEADDRESS = "calculateCreateProxyWithNonceAddress";

    public static final String FUNC_CREATEPROXY = "createProxy";

    public static final String FUNC_CREATEPROXYWITHCALLBACK = "createProxyWithCallback";

    public static final String FUNC_CREATEPROXYWITHNONCE = "createProxyWithNonce";

    public static final String FUNC_PREDICTPROXYADDRESS = "predictProxyAddress";

    public static final String FUNC_PROXYCREATIONCODE = "proxyCreationCode";

    public static final String FUNC_PROXYRUNTIMECODE = "proxyRuntimeCode";

    public static final Event PROXYCREATION_EVENT = new Event("ProxyCreation", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}, new TypeReference<Address>() {}));
    ;

    @Deprecated
    protected GnosisSafeProxyFactory(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected GnosisSafeProxyFactory(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected GnosisSafeProxyFactory(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected GnosisSafeProxyFactory(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public List<ProxyCreationEventResponse> getProxyCreationEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = extractEventParametersWithLog(PROXYCREATION_EVENT, transactionReceipt);
        ArrayList<ProxyCreationEventResponse> responses = new ArrayList<ProxyCreationEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ProxyCreationEventResponse typedResponse = new ProxyCreationEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.proxy = (String) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.singleton = (String) eventValues.getNonIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ProxyCreationEventResponse> proxyCreationEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new Function<Log, ProxyCreationEventResponse>() {
            @Override
            public ProxyCreationEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(PROXYCREATION_EVENT, log);
                ProxyCreationEventResponse typedResponse = new ProxyCreationEventResponse();
                typedResponse.log = log;
                typedResponse.proxy = (String) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.singleton = (String) eventValues.getNonIndexedValues().get(1).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ProxyCreationEventResponse> proxyCreationEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(PROXYCREATION_EVENT));
        return proxyCreationEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> calculateCreateProxyWithNonceAddress(String _singleton, byte[] initializer, BigInteger saltNonce) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_CALCULATECREATEPROXYWITHNONCEADDRESS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _singleton), 
                new org.web3j.abi.datatypes.DynamicBytes(initializer), 
                new org.web3j.abi.datatypes.generated.Uint256(saltNonce)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> createProxy(String singleton, byte[] data) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_CREATEPROXY, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, singleton), 
                new org.web3j.abi.datatypes.DynamicBytes(data)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> createProxyWithCallback(String _singleton, byte[] initializer, BigInteger saltNonce, String callback) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_CREATEPROXYWITHCALLBACK, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _singleton), 
                new org.web3j.abi.datatypes.DynamicBytes(initializer), 
                new org.web3j.abi.datatypes.generated.Uint256(saltNonce), 
                new org.web3j.abi.datatypes.Address(160, callback)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> createProxyWithNonce(String _singleton, byte[] initializer, BigInteger saltNonce) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(
                FUNC_CREATEPROXYWITHNONCE, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _singleton), 
                new org.web3j.abi.datatypes.DynamicBytes(initializer), 
                new org.web3j.abi.datatypes.generated.Uint256(saltNonce)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<String> predictProxyAddress(String _singleton, byte[] initializer, BigInteger saltNonce) {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_PREDICTPROXYADDRESS, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, _singleton), 
                new org.web3j.abi.datatypes.DynamicBytes(initializer), 
                new org.web3j.abi.datatypes.generated.Uint256(saltNonce)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<byte[]> proxyCreationCode() {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_PROXYCREATIONCODE, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<DynamicBytes>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    public RemoteFunctionCall<byte[]> proxyRuntimeCode() {
        final org.web3j.abi.datatypes.Function function = new org.web3j.abi.datatypes.Function(FUNC_PROXYRUNTIMECODE, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<DynamicBytes>() {}));
        return executeRemoteCallSingleValueReturn(function, byte[].class);
    }

    @Deprecated
    public static GnosisSafeProxyFactory load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new GnosisSafeProxyFactory(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static GnosisSafeProxyFactory load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new GnosisSafeProxyFactory(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static GnosisSafeProxyFactory load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new GnosisSafeProxyFactory(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static GnosisSafeProxyFactory load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new GnosisSafeProxyFactory(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<GnosisSafeProxyFactory> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(GnosisSafeProxyFactory.class, web3j, credentials, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<GnosisSafeProxyFactory> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(GnosisSafeProxyFactory.class, web3j, credentials, gasPrice, gasLimit, BINARY, "");
    }

    public static RemoteCall<GnosisSafeProxyFactory> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(GnosisSafeProxyFactory.class, web3j, transactionManager, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<GnosisSafeProxyFactory> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(GnosisSafeProxyFactory.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, "");
    }

    public static class ProxyCreationEventResponse extends BaseEventResponse {
        public String proxy;

        public String singleton;
    }
}
