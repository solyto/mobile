import type { Todo } from '$lib/types/todo.ts';
import { daysSince } from '$lib/helpers/DateHelper';

const priorityBaseScore = { high: 100, medium: 50, low: 0 };
const effortModifier = { high: 0, medium: 25, low: 50 };
const overdueModifier = 100;
const todayModifier = 50;
const tomorrowModifier = 25;
const oldModifier = 50;
const maxScore = priorityBaseScore.high + effortModifier.low + overdueModifier + oldModifier;

export default class TodoRelevanceService {
	getScoredTodos(todos: Todo[]): Todo[] {
		const scored_todos: Todo[] = [...todos];

		for (const [i, todo] of scored_todos.entries()) {
			let score = priorityBaseScore[todo.priority];

			if (todo.effort !== null) {
				score = score + effortModifier[todo.effort];
			}

			if (todo.due_at !== null) {
				const daysSinceDue = daysSince(new Date(todo.due_at));

				if (daysSinceDue > 0) {
					score = score + overdueModifier;
				} else if (daysSinceDue === 0) {
					score = score + todayModifier;
				} else if (daysSinceDue === -1) {
					score = score + tomorrowModifier;
				}
			}

			const daysSinceCreation = daysSince(new Date(todo.created_at));

			if (daysSinceCreation > 30) {
				score = score + oldModifier;
			}

			scored_todos[i].relevance = score / maxScore;
		}

		return scored_todos;
	}
}
