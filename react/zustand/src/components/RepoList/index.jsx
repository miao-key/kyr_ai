import { useEffect } from "react";
import { useRepoStore } from "../../store/repos";


const RepoList = () => {
    const {repos,loading,error,fetchRepos} = useRepoStore();
    useEffect (() =>{
        fetchRepos();
    },[])
    return (
        <>
            <ul>
                {
                    repos.map(repo => (
                        <li key={repo.id}>
                            <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                                {repo.name}
                            </a>
                            <p>{repo.description || 'No description'}</p>
                        </li>
                    ))
                }
            </ul>
        </>
    )
}

export default RepoList;